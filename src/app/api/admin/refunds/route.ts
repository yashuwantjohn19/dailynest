import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '../../../../lib/auth'
import { apiErrorResponse } from '../../../../lib/api/errors'
import { createRazorpayRefund } from '../../../../lib/payments/razorpay'
import { createAdminClient } from '../../../../lib/supabase/admin'

const actionSchema = z.object({ requestId: z.string().uuid(), decision: z.enum(['approve','reject']), note: z.string().trim().max(500).optional() })

export async function GET() {
  try {
    const { supabase } = await requireAdmin()
    const { data, error } = await supabase.from('refund_requests')
      .select('id,user_id,amount_paise,reason,status,auto_eligible,created_at,review_note,profiles!refund_requests_user_id_fkey(name,email),payment_orders(razorpay_payment_id)')
      .order('created_at', { ascending: false }).limit(100)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ refunds: data || [] })
  } catch (error) { return apiErrorResponse(error) }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = actionSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid refund review.' }, { status: 400 })
    const { supabase } = await requireAdmin()
    const { data: reviewed, error } = await supabase.rpc('review_wallet_refund', {
      p_request_id: parsed.data.requestId, p_decision: parsed.data.decision, p_review_note: parsed.data.note || null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (parsed.data.decision === 'reject') return NextResponse.json({ refund: reviewed })

    const admin = createAdminClient()
    const { data: requestRow, error: loadError } = await admin.from('refund_requests')
      .select('id,amount_paise,payment_orders(razorpay_payment_id)').eq('id', parsed.data.requestId).single()
    const payment = requestRow?.payment_orders as unknown as { razorpay_payment_id: string | null } | null
    if (loadError || !requestRow || !payment?.razorpay_payment_id) {
      await admin.rpc('complete_wallet_refund', { p_request_id: parsed.data.requestId, p_success: false, p_payout_reference: '', p_failure_note: 'Original payment could not be loaded' })
      return NextResponse.json({ error: 'Original payment could not be loaded.' }, { status: 409 })
    }
    try {
      const gatewayRefund = await createRazorpayRefund({ paymentId: payment.razorpay_payment_id, amount: requestRow.amount_paise, requestId: requestRow.id })
      const { data: completed, error: completionError } = await admin.rpc('complete_wallet_refund', { p_request_id: requestRow.id, p_success: true, p_payout_reference: gatewayRefund.id, p_failure_note: null })
      if (completionError) return NextResponse.json({ error: 'Gateway refund started but ledger completion needs review.' }, { status: 500 })
      return NextResponse.json({ refund: completed, gatewayStatus: gatewayRefund.status })
    } catch (refundError) {
      await admin.rpc('complete_wallet_refund', { p_request_id: requestRow.id, p_success: false, p_payout_reference: '', p_failure_note: refundError instanceof Error ? refundError.message : 'Gateway refund failed' })
      return NextResponse.json({ error: 'Razorpay could not process this refund. The wallet hold was released.' }, { status: 502 })
    }
  } catch (error) { return apiErrorResponse(error) }
}
