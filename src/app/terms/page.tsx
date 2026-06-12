'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, Info, HelpCircle, AlertCircle } from 'lucide-react'

export default function TermsPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Public Header */}
      <header className="w-full bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-green-600 bg-clip-text text-transparent">
                DailyNest
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-indigo-650 font-medium">Home</Link>
              <Link href="/subscription" className="text-gray-600 hover:text-indigo-650 font-medium">Subscription</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-indigo-650 font-medium">Dashboard</Link>
              <Link href="/admin" className="text-gray-600 hover:text-indigo-650 font-medium">Admin</Link>
            </div>

            <div className="flex items-center">
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-750 transition-colors">
                Sign In
              </Link>
              <div className="md:hidden ml-3">
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="p-2 rounded-lg text-gray-650 hover:bg-gray-50"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
            <Link href="/" className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-55">Home</Link>
            <Link href="/subscription" className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-55">Subscription</Link>
            <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-55">Dashboard</Link>
            <Link href="/admin" className="block px-3 py-2 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-55">Admin</Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-6 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="bg-white rounded-3xl border border-gray-150 shadow-xl p-8 md:p-12 space-y-8">
          
          {/* Headline */}
          <div className="text-center md:text-left border-b border-gray-100 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-gray-550">
              Last updated: June 11, 2026 • DailyNest Chennai Delivery Policies
            </p>
          </div>

          {/* Refund Notice Banner */}
          <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-100 text-sm text-yellow-800 flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Instant Skip Refunds:</span> Skipping any scheduled delivery day via the Calendar before 4:00 PM on the day of delivery guarantees an instant points refund credited back to your DailyNest wallet balance.
            </div>
          </div>

          {/* Details sections */}
          <div className="space-y-6 text-sm text-gray-655 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-500" /> 1. Subscriptions & Billing
              </h2>
              <p>
                DailyNest subscriptions are auto-renewed monthly. The selected plan fee is charged from your wallet on setup. If your wallet balance drops to zero or below, future deliveries will be paused until a top-up occurs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-500" /> 2. Delivery Scheduling
              </h2>
              <p>
                Baking production occurs daily in our centralized Chennai kitchen. Delivery windows occur between 6:00 PM and 8:00 PM. Chapatis are placed in insulated hot-boxes on resident apartment door handles.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-indigo-500" /> 3. Wallet Refunding Policy
              </h2>
              <p>
                Points credited to the DailyNest wallet are non-redeemable for bank cash withdrawals but carry a lifetime validity for purchasing chapati delivery plans or scheduling single orders.
              </p>
            </section>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div>DailyNest © 2026</div>
          <div className="flex items-center space-x-4 mt-3 md:mt-0">
            <Link href="/privacy" className="hover:text-indigo-650">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-650 font-semibold">Terms</Link>
            <Link href="/contact" className="hover:text-indigo-650">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
