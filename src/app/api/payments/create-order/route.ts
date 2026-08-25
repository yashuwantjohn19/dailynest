import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { createRazorpayOrder, razorpayConfigured } from '../../../../lib/payments/razorpay'
import { createAdminClient } from '../../../../lib/supabase/admin'

const schema = z.discriminatedUnion('purpose', [
  z.object({ purpose: z.literal('wallet_topup'), amount_paise: z.number().int().min(10000).max(10000000) }),
  z.object({ purpose: z.literal('subscription_delivery'), subscription_id: z.string().uuid() }),
])

export async function POST(request: NextRequest) {
  try {
    if (!razorpayConfigured) return NextResponse.json({ error: 'Online payments are not configured yet.' }, { status: 503 })
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payment request.' }, { status: 400 })
    const { supabase, user } = await requireUser()
    const admin = createAdminClient()
    let amountPaise: number
    let subscriptionId: string | null = null

    if (parsed.data.purpose === 'wallet_topup') amountPaise = parsed.data.amount_paise
    else {
      subscriptionId = parsed.data.subscription_id
      const { data: subscription, error } = await supabase.from('subscriptions').select('id,status,subscription_items(units,products(id,product_prices(amount_paise,valid_until)))').eq('id', subscriptionId).eq('user_id', user.id).single()
      if (error || !subscription) return NextResponse.json({ error: 'Subscription not found.' }, { status: 404 })
      if (subscription.status !== 'pending_payment') return NextResponse.json({ error: 'This subscription is not awaiting payment.' }, { status: 409 })
      const items = (subscription.subscription_items || []) as unknown as Array<{ units: number; products: { product_prices: Array<{ amount_paise: number; valid_until: string | null }> } }>
      amountPaise = items.reduce((sum, item) => sum + item.units * (item.products.product_prices.find(price => price.valid_until === null)?.amount_paise || 0), 0)
      if (!amountPaise) return NextResponse.json({ error: 'No active price exists for this subscription.' }, { status: 409 })
    }

    const internalId = randomUUID()
    const receipt = `dn_${internalId.replaceAll('-', '').slice(0, 24)}`
    const order = await createRazorpayOrder({ amount: amountPaise, receipt, notes: { user_id: user.id, purpose: parsed.data.purpose, payment_order_id: internalId } })
    const { error: insertError } = await admin.from('payment_orders').insert({ id: internalId, user_id: user.id, purpose: parsed.data.purpose, subscription_id: subscriptionId, amount_paise: amountPaise, razorpay_order_id: order.id, receipt })
    if (insertError) return NextResponse.json({ error: 'Payment order could not be recorded.' }, { status: 500 })
    return NextResponse.json({ order_id: order.id, amount_paise: amountPaise, currency: 'INR', key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID })
  } catch (error) { return apiErrorResponse(error) }
}
