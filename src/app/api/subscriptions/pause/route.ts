import { NextRequest, NextResponse } from 'next/server'
import { supabase, isMockMode } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 })
    }

    if (isMockMode) {
      return NextResponse.json({
        subscription: {
          id: subscriptionId,
          status: 'paused',
          paused: true
        }
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'paused' })
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ subscription: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}