import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isSupabaseConfigured } from '../../../../lib/supabase/config'
import { createClient } from '../../../../lib/supabase/server'

const requestSchema = z.object({
  phone: z.string().trim().min(8).max(20),
  otp: z.string().trim().regex(/^\d{6}$/),
})

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
    }

    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Phone and a six-digit OTP are required' }, { status: 400 })

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      phone: parsed.data.phone,
      token: parsed.data.otp,
      type: 'sms',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ user: data.user })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
