import 'server-only'

import type { User } from '@supabase/supabase-js'
import { createClient } from './supabase/server'

export class AuthenticationError extends Error {}
export class AuthorizationError extends Error {}

export async function requireUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>
  user: User
}> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) throw new AuthenticationError('Unauthorized')
  return { supabase, user: data.user }
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || data?.role !== 'admin') {
    throw new AuthorizationError('Admin access required')
  }

  return { supabase, user }
}
