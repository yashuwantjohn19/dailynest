import { NextResponse } from 'next/server'
import { requireUser } from '../../../lib/auth'
import { apiErrorResponse } from '../../../lib/api/errors'

export async function GET() {
  try {
    const { supabase, user } = await requireUser()
    const today = new Date().toISOString().slice(0, 10)
    const [subscription, address, wallet, nextDelivery] = await Promise.all([
      supabase.from('subscriptions').select('id,status,start_date,subscription_items(units,bundle_quantity_snapshot),subscription_weekdays(weekday)').eq('user_id', user.id).in('status', ['pending_payment', 'active', 'paused']).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('addresses').select('label,city,postal_code').eq('user_id', user.id).eq('is_default', true).maybeSingle(),
      supabase.from('wallets').select('balance_paise,held_paise').eq('user_id', user.id).maybeSingle(),
      supabase.from('deliveries').select('id,delivery_date,quantity,status').eq('user_id', user.id).gte('delivery_date', today).neq('status', 'cancelled').order('delivery_date').limit(1).maybeSingle(),
    ])
    const error = subscription.error || address.error || wallet.error || nextDelivery.error
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const sub = subscription.data
    const quantity = (sub?.subscription_items || []).reduce((sum, item) => sum + item.units * item.bundle_quantity_snapshot, 0)
    return NextResponse.json({
      subscription: sub ? { id: sub.id, status: sub.status, start_date: sub.start_date, quantity, weekdays: sub.subscription_weekdays.map(item => item.weekday) } : null,
      address: address.data,
      wallet: wallet.data || { balance_paise: 0, held_paise: 0 },
      next_delivery: nextDelivery.data,
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
