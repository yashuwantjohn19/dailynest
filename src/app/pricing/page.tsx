import Link from 'next/link'
import { Check, CreditCard, WalletCards } from 'lucide-react'
import PublicShell from '../../components/PublicShell'
import { PLANS, PRICING_NOTE } from '../../config/plans'

export default function PricingPage() {
  return (
    <PublicShell>
      <section className="section-wrap !py-16 sm:!py-24">
        <div className="text-center">
          <p className="eyebrow text-[#bb4824]">Simple launch pricing</p>
          <h1 className="editorial-title mt-4 text-6xl font-black sm:text-7xl">Pick your batch.</h1>
          <p className="mx-auto mt-5 max-w-xl text-[#6f625f]">The price shown is for each delivery day you choose.</p>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article key={plan.id} className="surface-card flex flex-col items-center p-7 text-center">
              <div className={`mini-chapati disc-${plan.id}`}><span>{plan.quantity}</span></div>
              <p className="eyebrow mt-6 text-[#6f625f]">{plan.name}</p>
              <p className="mt-2 text-4xl font-black">₹{plan.price}</p>
              <p className="text-xs font-bold text-[#6f625f]">per selected delivery</p>
              <p className="mt-5 text-sm text-[#6f625f]">{plan.description}</p>
              <ul className="mt-6 space-y-2 text-left text-sm font-semibold">
                <li className="flex gap-2"><Check size={17} className="text-[#397354]" />Pick your weekdays</li>
                <li className="flex gap-2"><Check size={17} className="text-[#397354]" />Mix bundle sizes</li>
                <li className="flex gap-2"><Check size={17} className="text-[#397354]" />Pause or cancel</li>
              </ul>
              <Link href="/login?next=/subscription" className="button button-dark mt-7 w-full">Choose {plan.name}</Link>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs font-semibold text-[#6f625f]">{PRICING_NOTE}</p>
      </section>
      <section className="bg-[#f1e4cf]">
        <div className="section-wrap !py-14">
          <h2 className="text-center text-3xl font-black">Two ways to pay—once ready.</h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
            <article className="bg-[#fffdf8] p-6"><CreditCard className="text-[#e56b35]" /><h3 className="mt-4 font-black">Pay directly</h3><p className="mt-2 text-sm text-[#6f625f]">Use UPI or card for an order or plan.</p></article>
            <article className="bg-[#fffdf8] p-6"><WalletCards className="text-[#397354]" /><h3 className="mt-4 font-black">Use wallet</h3><p className="mt-2 text-sm text-[#6f625f]">Optionally top up, then pay from balance.</p></article>
          </div>
          <p className="mt-6 text-center text-xs font-black uppercase tracking-wider text-[#bb4824]">Gateway setup in progress · No payment taken</p>
        </div>
      </section>
    </PublicShell>
  )
}
