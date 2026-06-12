import { NextRequest, NextResponse } from 'next/server'
import { supabase, isMockMode } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { plan, mealsPerWeek, startDate, apartmentId, quantity, daysSelected } = await request.json()

    if (!plan || !mealsPerWeek) {
      return NextResponse.json({ error: 'Plan and meals per week are required' }, { status: 400 })
    }

    if (isMockMode) {
      return NextResponse.json({
        subscription: {
          id: `sub-${Date.now()}`,
          user_id: 'user-mock-123',
          apartment_id: apartmentId || 'apt-1',
          plan,
          meals_per_week: mealsPerWeek,
          quantity: quantity || 4,
          start_date: startDate || new Date().toISOString().split('T')[0],
          status: 'active',
          days_selected: daysSelected || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          paused: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan,
        meals_per_week: mealsPerWeek,
        start_date: startDate || new Date().toISOString(),
        status: 'active',
      })
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