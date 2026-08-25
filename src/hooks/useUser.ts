'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export type AppRole = 'customer' | 'admin'

export interface AppUser {
  id: string
  phone: string
  name?: string
  email?: string
  avatar_url?: string
  role: AppRole
}

async function buildAppUser(authUser: SupabaseUser): Promise<AppUser> {
  const fallback: AppUser = {
    id: authUser.id,
    phone: authUser.phone || '',
    name: authUser.user_metadata?.name || 'DailyNest Resident',
    email: authUser.email || '',
    avatar_url: authUser.user_metadata?.avatar_url,
    role: 'customer',
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('name, phone, email, avatar_url, role')
    .eq('id', authUser.id)
    .maybeSingle()

  if (error || !data) return fallback

  return {
    ...fallback,
    name: data.name || fallback.name,
    phone: data.phone || fallback.phone,
    email: data.email || fallback.email,
    avatar_url: data.avatar_url || fallback.avatar_url,
    role: data.role === 'admin' ? 'admin' : 'customer',
  }
}

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setUser(null)
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      setUser(null)
      setLoading(false)
      return
    }

    setUser(await buildAppUser(data.user))
    setLoading(false)
  }, [])

  useEffect(() => {
    const initialRefresh = window.setTimeout(() => void refresh(), 0)

    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      buildAppUser(session.user).then(setUser).finally(() => setLoading(false))
    })

    return () => {
      window.clearTimeout(initialRefresh)
      listener.subscription.unsubscribe()
    }
  }, [refresh])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return { user, loading, logout, refresh }
}
