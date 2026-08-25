import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '../../../../lib/payments/razorpay'
import { createAdminClient } from '../../../../lib/supabase/admin'

type Payload = { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; status?: string } } } }
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''
  const eventId = request.headers.get('x-razorpay-event-id') || ''
  if (!eventId || !verifyWebhookSignature(rawBody, signature)) return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 })
  const payload = JSON.parse(rawBody) as Payload
  const admin = createAdminClient()
  const { error: eventError } = await admin.from('payment_webhook_events').insert({ event_id: eventId, event_type: payload.event || 'unknown', payload })
  if (eventError && eventError.code !== '23505') return NextResponse.json({ error: 'Webhook could not be recorded.' }, { status: 500 })

  if (payload.event === 'payment.captured') {
    const payment = payload.payload?.payment?.entity
    if (!payment?.order_id || !payment.id) return NextResponse.json({ error: 'Malformed captured payment.' }, { status: 400 })
    const { data: order } = await admin.from('payment_orders').select('*').eq('razorpay_order_id', payment.order_id).single()
    if (!order || payment.amount !== order.amount_paise) return NextResponse.json({ error: 'Payment order or amount mismatch.' }, { status: 409 })
    const { error: captureError } = await admin.rpc('capture_payment_order', { p_order_id: order.id, p_payment_id: payment.id })
    if (captureError) return NextResponse.json({ error: 'Payment capture recording failed.' }, { status: 500 })
  }
  await admin.from('payment_webhook_events').update({ processed_at: new Date().toISOString() }).eq('event_id', eventId)
  return NextResponse.json({ received: true })
}
