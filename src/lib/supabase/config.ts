const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabasePublishableKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)?.trim()

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('YOUR_PROJECT') &&
    !supabasePublishableKey.includes('YOUR_SUPABASE')
)

export const publicSupabaseConfig = {
  url: supabaseUrl || 'https://placeholder.supabase.co',
  publishableKey: supabasePublishableKey || 'placeholder-publishable-key',
}
