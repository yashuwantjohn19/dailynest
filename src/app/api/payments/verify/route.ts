import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { verifyCheckoutSignature } from '../../../../lib/payments/razorpay'
import { createAdminClient } from '../../../../lib/supabase/admin'

const schema = z.object({ razorpay_order_id: z.string().min(5), razorpay_payment_id: z.string().min(5), razorpay_signature: z.string().min(20) })
export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid verification payload.' }, { status: 400 })
    const { user } = await requireUser()
    const admin = createAdminClient()
    const { data: order } = await admin.from('payment_orders').select('id,user_id,status').eq('razorpay_order_id', parsed.data.razorpay_order_id).single()
    if (!order || order.user_id !== user.id) return NextResponse.json({ error: 'Payment order not found.' }, { status: 404 })
    if (!verifyCheckoutSignature(parsed.data.razorpay_order_id, parsed.data.razorpay_payment_id, parsed.data.razorpay_signature)) return NextResponse.json({ error: 'Payment signature is invalid.' }, { status: 400 })
    if (order.status === 'created') {
      const { error: updateError } = await admin.from('payment_orders').update({ status: 'verified', razorpay_payment_id: parsed.data.razorpay_payment_id }).eq('id', order.id)
      if (updateError) return NextResponse.json({ error: 'Payment verification could not be recorded.' }, { status: 500 })
    }
    return NextResponse.json({ verified: true, message: 'Payment verified. Balance updates after capture confirmation.' })
  } catch (error) { return apiErrorResponse(error) }
}
