import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { publicSupabaseConfig } from './config'

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!serviceKey) throw new Error('Server payment database access is not configured')
  return createClient(publicSupabaseConfig.url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}
