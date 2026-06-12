import { NextRequest, NextResponse } from 'next/server'
import { supabase, isMockMode } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    if (isMockMode) {
      return NextResponse.json({
        profile: {
          id: 'user-mock-123',
          name: 'Yashuwant Vijay',
          phone: '+91 98765 43210',
          email: 'yashuwant@dailynest.com',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        }
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({
        profile: {
          id: user.id,
          name: 'Resident',
          phone: user.phone || '',
          email: user.email || ''
        }
      })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}