// Temporary compatibility exports for existing Client Components.
import { createClient } from './supabase/client'
import { isSupabaseConfigured } from './supabase/config'

export { isSupabaseConfigured } from './supabase/config'
export const supabase = createClient()
export const isMockMode = !isSupabaseConfigured
