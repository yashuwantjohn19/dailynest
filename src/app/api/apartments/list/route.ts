import { NextResponse } from 'next/server'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { isSupabaseConfigured } from '../../../../lib/supabase/config'

export async function GET() {
  try {
    if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
    const { supabase } = await requireUser()

    const { data, error } = await supabase
      .from('apartments')
      .select('*')

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ apartments: data })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
