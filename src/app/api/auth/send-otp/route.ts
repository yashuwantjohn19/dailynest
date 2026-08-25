import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isSupabaseConfigured } from '../../../../lib/supabase/config'
import { createClient } from '../../../../lib/supabase/server'

const requestSchema = z.object({ phone: z.string().trim().min(8).max(20) })

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
    }

    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 })

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({ phone: parsed.data.phone })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ message: 'OTP sent successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
