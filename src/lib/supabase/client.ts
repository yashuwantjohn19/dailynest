'use client'

import { createBrowserClient } from '@supabase/ssr'
import { publicSupabaseConfig } from './config'

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  browserClient ??= createBrowserClient(
    publicSupabaseConfig.url,
    publicSupabaseConfig.publishableKey
  )

  return browserClient
}
