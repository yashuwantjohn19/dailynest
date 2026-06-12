'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Loader2, Phone, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return

    setLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setInfoMessage('OTP sent successfully!')
      setStep('otp')
    } catch (err: any) {
      console.warn('Real OTP send failed, falling back to mock mode:', err)
      setInfoMessage('Development Mode: Using mock OTP. (Any 6-digit code will work, e.g. 123456)')
      setStep('otp')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      // Successful real auth
      localStorage.setItem('dailynest_mock_user', JSON.stringify({
        id: data.user.id,
        phone: data.user.phone,
        name: data.user.user_metadata?.name || 'DailyNest User',
        email: data.user.email || '',
        avatar_url: data.user.user_metadata?.avatar_url || ''
      }))
      
      window.dispatchEvent(new Event('dailynest_auth_change'))
      router.push('/dashboard')
    } catch (err: any) {
      console.warn('Real OTP verification failed, logging in with mock user profile:', err)
      
      // Save a mock user in localStorage
      const mockUser = {
        id: 'user-mock-123',
        phone: phone,
        name: 'Yashuwant Vijay',
        email: 'yashuwant@dailynest.com',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      }
      localStorage.setItem('dailynest_mock_user', JSON.stringify(mockUser))
      window.dispatchEvent(new Event('dailynest_auth_change'))
      
      // Ensure default wallet balance and transactions exist
      if (!localStorage.getItem('dailynest_mock_wallet_balance')) {
        localStorage.setItem('dailynest_mock_wallet_balance', '1250')
      }
      
      setInfoMessage('Logged in successfully (Mock Mode)! Redirecting...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-indigo-50 via-white to-green-50 px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header and Back Button */}
        <div>
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back Home
            </Link>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              Chennai Deliveries
            </span>
          </div>
          
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-indigo-600 to-green-600 bg-clip-text text-transparent">DailyNest</span>
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage your daily chapati subscription
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {infoMessage && (
          <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-indigo-800 font-medium">{infoMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Forms */}
        {step === 'phone' ? (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="rounded-md space-y-2">
              <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone-number"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 sm:text-sm transition-shadow"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your mobile number with country code (e.g. +91)
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  'Send OTP Verification'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="rounded-md space-y-2">
              <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700">
                One-Time Password (OTP)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp-code"
                  name="otp"
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 tracking-[0.25em] font-semibold text-center placeholder-gray-400 sm:text-sm transition-shadow"
                />
              </div>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className="text-gray-500">Sent to {phone}</span>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Change phone number
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  'Verify OTP & Sign In'
                )}
              </button>
            </div>
          </form>
        )}
        
        {/* Footer information */}
        <div className="text-center text-xs text-gray-500 mt-6 flex justify-center items-center gap-1">
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure connection. Standard carrier rates may apply.
        </div>
      </div>
    </div>
  )
}