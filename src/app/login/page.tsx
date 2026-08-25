'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfoMessage(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address, for example name@example.com.')
      return
    }

    if (!isSupabaseConfigured) {
      setError('Sign-in is temporarily unavailable because the authentication service is not configured.')
      return
    }

    setLoading(true)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(new URLSearchParams(window.location.search).get('next') || '/dashboard')}`,
      },
    })
    setLoading(false)

    if (otpError) {
      setError(otpError.message)
      return
    }

    setEmail(normalizedEmail)
    setInfoMessage('Sign-in link sent. Check your inbox and spam folder, then click the link to continue.')
  }

  return (
    <main className="kitchen-canvas min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[#dfd0bd] bg-[#fffdf8] shadow-[0_25px_80px_rgba(50,28,49,.12)] md:min-h-[720px] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="hidden flex-col justify-between bg-[#321c31] p-12 text-white lg:flex">
          <Link href="/" className="text-2xl font-black tracking-[-.05em]">Daily<span className="text-[#f18a55]">Nest</span></Link>
          <div><p className="eyebrow text-[#f5c974]">Your kitchen companion</p><h1 className="editorial-title mt-5 text-6xl font-black">Dinner plans, kept beautifully simple.</h1><p className="mt-6 max-w-md leading-7 text-white/65">Choose your chapati count, schedule delivery days, and follow every wallet transaction in one calm place.</p></div>
          <div className="flex gap-3 text-sm text-white/65"><ShieldCheck className="h-5 w-5 text-[#8db69a]"/>Secure email verification powered by Supabase</div>
        </section>
        <section className="flex items-center p-6 sm:p-10 lg:p-14"><div className="w-full space-y-8">
        <Link href="/" className="mb-2 hidden rounded-2xl bg-[#321c31] px-5 py-4 text-xl font-black tracking-[-.05em] text-white md:block lg:hidden">Daily<span className="text-[#f18a55]">Nest</span><span className="ml-3 text-xs font-semibold tracking-normal text-white/60">Fresh deliveries for apartment homes</span></Link>
        <div>
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-sm font-bold text-[#6f625f] hover:text-[#321c31]">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back Home
            </Link>
            <span className="eyebrow text-[#bb4824]">Password-free sign in</span>
          </div>

          <div className="mt-10">
            <p className="eyebrow text-[#397354]">Fresh local deliveries</p>
            <h2 className="editorial-title mt-3 text-4xl font-black text-[#321c31]">Welcome home.</h2>
            <p className="mt-3 text-sm leading-6 text-[#6f625f]">Enter your email and we will send you a secure sign-in link.</p>
          </div>
        </div>

        {error && <div id="auth-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        {infoMessage && (
          <div role="status" className="flex gap-3 rounded-xl border border-[#bcd0c1] bg-[#edf5ef] p-4">
            <CheckCircle2 className="h-5 w-5 text-[#397354] flex-shrink-0" />
            <p className="text-sm text-[#28543d] font-medium">{infoMessage}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="space-y-2">
              <label htmlFor="email-address" className="block text-sm font-bold text-[#321c31]">Email address</label>
              <div className="relative rounded-md shadow-sm">
                <Mail className="absolute left-4 top-4 h-5 w-5 text-[#9b8177]" />
                <input id="email-address" type="email" autoComplete="email" required aria-invalid={Boolean(error)} aria-describedby={error ? 'email-help auth-error' : 'email-help'} aria-errormessage={error ? 'auth-error' : undefined} placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full rounded-xl border border-[#cdbca6] bg-white py-3.5 pl-12 pr-4 text-[#321c31]" />
              </div>
              <p id="email-help" className="text-xs text-gray-500">No password is needed. The link expires after a short time.</p>
            </div>
            <button type="submit" disabled={loading} className="flex w-full justify-center rounded-xl bg-[#e56b35] px-4 py-3.5 font-bold text-white hover:bg-[#bb4824] disabled:opacity-50">
              {loading ? <Loader2 aria-label="Sending sign-in link" className="animate-spin h-5 w-5" /> : 'Email me a sign-in link'}
            </button>
        </form>

        <div className="border-t border-[#eadfce] pt-5 text-center text-xs leading-5 text-[#6f625f]">We only use your email for account access and essential service messages. Authentication is handled by Supabase.</div>
      </div></section></div>
    </main>
  )
}
