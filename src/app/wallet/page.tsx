'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { ArrowDownLeft, ArrowUpRight, CreditCard, Loader2, ShieldCheck, WalletCards } from 'lucide-react'
import Navigation from '../../components/Navigation'
import { useUser } from '../../hooks/useUser'
import { supabase } from '../../lib/supabase'

type Wallet = { balance_paise: number; held_paise: number }
type Transaction = { id: string; direction: 'credit' | 'debit'; amount_paise: number; balance_after_paise: number; description: string; created_at: string }
type Refund = { id: string; amount_paise: number; reason: string; status: string }
const money = (paise: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100)

type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }
type RazorpayOptions = { key: string; amount: number; currency: string; name: string; description: string; order_id: string; handler: (response: RazorpayResponse) => void; prefill?: { name?: string; email?: string; contact?: string }; theme?: { color: string }; modal?: { ondismiss: () => void } }
declare global { interface Window { Razorpay?: new (options: RazorpayOptions) => { open: () => void; on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void } } }

export default function WalletPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [refunds, setRefunds] = useState<Refund[]>([])
  const [busy, setBusy] = useState(true)
  const [topupRupees, setTopupRupees] = useState('500')
  const [paying, setPaying] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { if (!loading && !user) router.replace('/login?next=/wallet') }, [loading, user, router])
  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('wallets').select('balance_paise,held_paise').eq('user_id', user.id).maybeSingle(),
      supabase.from('wallet_transactions').select('id,direction,amount_paise,balance_after_paise,description,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('refund_requests').select('id,amount_paise,reason,status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ]).then(([w, t, r]) => {
      const queryError = w.error || t.error || r.error
      if (queryError) setError(queryError.message)
      else { setWallet(w.data ?? { balance_paise: 0, held_paise: 0 }); setTransactions(t.data ?? []); setRefunds(r.data ?? []) }
    }).finally(() => setBusy(false))
  }, [user])

  if (loading || !user) return <div className="app-surface flex items-center justify-center"><Loader2 className="animate-spin text-[#e56b35]" /></div>
  const available = (wallet?.balance_paise ?? 0) - (wallet?.held_paise ?? 0)

  const startTopup = async () => {
    setError(''); setPaymentMessage('')
    const amountPaise = Math.round(Number(topupRupees) * 100)
    if (!Number.isInteger(amountPaise) || amountPaise < 10000 || amountPaise > 10000000) { setError('Enter a top-up amount between ₹100 and ₹1,00,000.'); return }
    if (!window.Razorpay) { setError('Secure checkout is still loading. Please try again.'); return }
    setPaying(true)
    try {
      const orderResponse = await fetch('/api/payments/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purpose: 'wallet_topup', amount_paise: amountPaise }) })
      const order = await orderResponse.json() as { order_id?: string; amount_paise?: number; currency?: string; key_id?: string; error?: string }
      if (!orderResponse.ok || !order.order_id || !order.key_id || !order.amount_paise) throw new Error(order.error || 'Unable to create a payment order.')
      const checkout = new window.Razorpay({
        key: order.key_id, amount: order.amount_paise, currency: order.currency || 'INR', name: 'DailyNest', description: 'Wallet top-up', order_id: order.order_id,
        prefill: { name: user.name || undefined, email: user.email || undefined, contact: user.phone || undefined }, theme: { color: '#e56b35' },
        modal: { ondismiss: () => { setPaying(false); setPaymentMessage('Payment cancelled. No money was added.') } },
        handler: async (response) => {
          const verifyResponse = await fetch('/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) })
          const verification = await verifyResponse.json() as { verified?: boolean; message?: string; error?: string }
          setPaying(false)
          if (!verifyResponse.ok || !verification.verified) { setError(verification.error || 'Payment verification failed.'); return }
          setPaymentMessage(verification.message || 'Payment verified. Your wallet will update after capture confirmation.')
        },
      })
      checkout.on('payment.failed', (response) => { setPaying(false); setError(response.error?.description || 'Payment failed. Please try again.') })
      checkout.open()
    } catch (paymentError) { setPaying(false); setError(paymentError instanceof Error ? paymentError.message : 'Payment could not be started.') }
  }

  return <div className="app-surface"><Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" /><Navigation /><div className="lg:pl-64"><main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
    <header className="border-b border-[#dfd0bd] pb-7"><p className="eyebrow text-[#bb4824]">Payments & credit</p><h1 className="editorial-title mt-3 text-5xl font-black">DailyNest Wallet</h1><p className="mt-4 max-w-2xl leading-7 text-[#6f625f]">Your server-backed balance, reserved refunds, and auditable transaction history.</p></header>
    {error && <div role="alert" className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    {paymentMessage && <div role="status" className="mt-6 border border-green-200 bg-green-50 p-4 text-sm text-green-800">{paymentMessage}</div>}
    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <article className="surface-card p-7"><WalletCards className="text-[#397354]" /><p className="eyebrow mt-6 text-[#397354]">Available balance</p><h2 className="mt-2 text-5xl font-black tabular-nums">{busy ? '—' : money(available)}</h2><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#eadfce] pt-5 text-sm"><div><p className="text-[#6f625f]">Total</p><strong>{money(wallet?.balance_paise ?? 0)}</strong></div><div><p className="text-[#6f625f]">Refund holds</p><strong>{money(wallet?.held_paise ?? 0)}</strong></div></div><label className="mt-6 block text-sm font-bold">Top-up amount (₹)<input inputMode="decimal" value={topupRupees} onChange={event => setTopupRupees(event.target.value.replace(/[^0-9.]/g, ''))} className="mt-2 w-full rounded-lg border border-[#cdbca6] bg-white px-4 py-3" /></label><button type="button" onClick={startTopup} disabled={paying} className="button button-dark mt-3 w-full disabled:opacity-50">{paying ? <Loader2 className="animate-spin" /> : <CreditCard />} {paying ? 'Opening secure checkout…' : 'Add money securely'}</button><p className="mt-3 text-xs leading-5 text-[#6f625f]">Test mode · Razorpay handles UPI/card details. DailyNest never receives your card number or UPI PIN.</p></article>
      <article className="surface-card p-7"><CreditCard className="text-[#e56b35]" /><h2 className="mt-5 text-2xl font-black">Razorpay test checkout is connected</h2><p className="mt-3 text-sm leading-6 text-[#6f625f]">Use UPI or card for a direct subscription payment, or add funds here and choose wallet payment during subscription checkout.</p><p className="mt-5 text-xs font-black uppercase tracking-wider text-[#397354]">Secure server verification enabled · Test mode</p></article>
    </section>
    <section className="mt-10"><div className="flex items-end justify-between"><div><p className="eyebrow text-[#397354]">Audit trail</p><h2 className="mt-2 text-2xl font-black">Transactions</h2></div><ShieldCheck className="text-[#397354]" /></div>{busy ? <Loader2 className="mt-6 animate-spin" /> : transactions.length === 0 ? <div className="surface-card mt-5 p-8 text-center"><p className="font-black">No transactions yet</p><p className="mt-2 text-sm text-[#6f625f]">Verified top-ups, delivery deductions, refunds, and adjustments will appear here.</p></div> : <div className="mt-5 overflow-hidden border border-[#dfd0bd] bg-[#fffdf8]">{transactions.map(item => <article key={item.id} className="flex items-center gap-4 border-b border-[#eadfce] p-4 last:border-0">{item.direction === 'credit' ? <ArrowDownLeft className="text-[#397354]" /> : <ArrowUpRight className="text-[#bb4824]" />}<div className="min-w-0 flex-1"><p className="font-black">{item.description}</p><p className="text-xs text-[#6f625f]">{new Date(item.created_at).toLocaleString('en-IN')} · Balance {money(item.balance_after_paise)}</p></div><strong>{item.direction === 'credit' ? '+' : '−'}{money(item.amount_paise)}</strong></article>)}</div>}</section>
    <section className="mt-10"><p className="eyebrow text-[#bb4824]">Refunds</p><h2 className="mt-2 text-2xl font-black">Requests & review</h2>{refunds.length === 0 ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6f625f]">No refund requests. When unused funds are available, a request can reserve that amount for automatic processing or admin review.</p> : <div className="mt-5 grid gap-3">{refunds.map(refund => <article key={refund.id} className="surface-card flex items-center justify-between gap-4 p-5"><div><strong>{money(refund.amount_paise)}</strong><p className="text-sm text-[#6f625f]">{refund.reason}</p></div><span className="rounded-full bg-[#f1e4cf] px-3 py-1 text-xs font-black uppercase">{refund.status}</span></article>)}</div>}</section>
  </main></div></div>
}
