import { NextRequest, NextResponse } from 'next/server'
import { supabase, isMockMode } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
    }

    if (isMockMode) {
      return NextResponse.json({
        user: {
          id: 'user-mock-123',
          phone,
          email: 'yashuwant@dailynest.com',
          user_metadata: {
            name: 'Yashuwant Vijay',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
          }
        },
        session: { access_token: 'mock-token' }
      })
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data.user, session: data.session })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}