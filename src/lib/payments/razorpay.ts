import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import Razorpay from 'razorpay'

export const razorpayConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

export async function createRazorpayOrder(input: { amount: number; receipt: string; notes: Record<string,string> }) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !secret) throw new Error('Razorpay is not configured')
  const razorpay = new Razorpay({ key_id: keyId, key_secret: secret })
  const order = await razorpay.orders.create({ amount: input.amount, currency: 'INR', receipt: input.receipt, notes: input.notes })
  if (!order.id) throw new Error('Razorpay order creation failed')
  return { id: order.id }
}

export async function createRazorpayRefund(input: { paymentId: string; amount: number; requestId: string }) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !secret) throw new Error('Razorpay is not configured')
  const razorpay = new Razorpay({ key_id: keyId, key_secret: secret })
  const refund = await razorpay.payments.refund(input.paymentId, {
    amount: input.amount,
    speed: 'normal',
    notes: { refund_request_id: input.requestId },
  })
  if (!refund.id) throw new Error('Razorpay refund creation failed')
  return { id: refund.id, status: refund.status }
}

function safeMatch(expected: string, received: string) {
  const a = Buffer.from(expected, 'utf8'), b = Buffer.from(received, 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  return safeMatch(createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex'), signature)
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return false
  return safeMatch(createHmac('sha256', secret).update(rawBody).digest('hex'), signature)
}
