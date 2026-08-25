import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { isSupabaseConfigured } from '../../../../lib/supabase/config'

export async function GET() {
  try {
    if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('production')
      .select('*')
      .eq('date', tomorrow)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ production: data || [] })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
