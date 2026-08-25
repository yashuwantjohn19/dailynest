import { NextResponse } from 'next/server'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { isSupabaseConfigured } from '../../../../lib/supabase/config'

const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

type SubscriptionItemRow = {
  units: number
  bundle_quantity_snapshot: number
  products: { code: 'basic' | 'standard' | 'family' } | { code: 'basic' | 'standard' | 'family' }[] | null
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 })
    }

    const { supabase, user } = await requireUser()
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        start_date,
        subscription_items (
          units,
          bundle_quantity_snapshot,
          products (code)
        ),
        subscription_weekdays (weekday)
      `)
      .eq('user_id', user.id)
      .in('status', ['pending_payment', 'active', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ subscription: null })

    const items = (data.subscription_items || []) as SubscriptionItemRow[]
    const bundles = { basic: 0, standard: 0, family: 0 }
    let quantity = 0

    for (const item of items) {
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      if (product?.code) bundles[product.code] = item.units
      quantity += item.units * item.bundle_quantity_snapshot
    }

    const primaryPlan = (Object.entries(bundles) as Array<[keyof typeof bundles, number]>)
      .reduce((selected, entry) => entry[1] > selected[1] ? entry : selected, ['basic', 0] as [keyof typeof bundles, number])[0]

    const daysSelected = (data.subscription_weekdays || [])
      .map(({ weekday }: { weekday: number }) => weekdayNames[weekday])
      .filter(Boolean)

    const { data: amountDue } = await supabase.rpc('subscription_delivery_amount', {
      p_subscription_id: data.id,
    })

    return NextResponse.json({
      subscription: {
        id: data.id,
        plan: primaryPlan,
        quantity,
        days_selected: daysSelected,
        start_date: data.start_date,
        status: data.status,
        paused: data.status === 'paused',
        bundles,
        amount_paise: Number(amountDue || 0),
      },
    })
  } catch (error) {
    return apiErrorResponse(error)
  }
}
