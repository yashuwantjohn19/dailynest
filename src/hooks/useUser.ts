import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface AppUser {
  id: string
  phone: string
  name?: string
  email?: string
  avatar_url?: string
}

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
        if (error) throw error
        if (supabaseUser) {
          setUser({
            id: supabaseUser.id,
            phone: supabaseUser.phone || '',
            name: supabaseUser.user_metadata?.name || 'DailyNest Resident',
            email: supabaseUser.email,
            avatar_url: supabaseUser.user_metadata?.avatar_url
          })
        } else {
          // Check for mock user in localStorage
          const localUser = localStorage.getItem('dailynest_mock_user')
          if (localUser) {
            setUser(JSON.parse(localUser))
          }
        }
      } catch (err) {
        console.warn('Supabase auth failed or not configured, checking mock user:', err)
        const localUser = localStorage.getItem('dailynest_mock_user')
        if (localUser) {
          setUser(JSON.parse(localUser))
        }
      } finally {
        setLoading(false)
      }
    }
    getUser()

    // Listen to changes (mock or real)
    const handleAuthChange = () => {
      const localUser = localStorage.getItem('dailynest_mock_user')
      if (localUser) {
        setUser(JSON.parse(localUser))
      } else {
        setUser(null)
      }
    }
    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('dailynest_auth_change', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('dailynest_auth_change', handleAuthChange)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('dailynest_mock_user')
    setUser(null)
    supabase.auth.signOut().catch(() => {})
    window.dispatchEvent(new Event('dailynest_auth_change'))
  }

  return { user, loading, logout }
}