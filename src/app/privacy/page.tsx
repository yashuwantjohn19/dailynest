'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
              Privacy Policy Statement
            </h1>
            <p className="mt-2 text-sm text-gray-550">
              Last updated: June 11, 2026 • DailyNest Chennai Operations
            </p>
          </div>

          {/* Cards for key themes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
              <Lock className="h-6 w-6 text-indigo-600 mb-3" />
              <h3 className="font-bold text-gray-950 text-sm">Secured OTP Login</h3>
              <p className="text-xs text-gray-650 mt-1 leading-relaxed">
                Mobile connections use secure SMS validation loops to keep account setups private.
              </p>
            </div>
            <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100/50">
              <Shield className="h-6 w-6 text-green-600 mb-3" />
              <h3 className="font-bold text-gray-950 text-sm">Wallet Data Protection</h3>
              <p className="text-xs text-gray-650 mt-1 leading-relaxed">
                Wallet transaction ledgers are cryptographically linked to secure user sessions.
              </p>
            </div>
            <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100/50">
              <Eye className="h-6 w-6 text-purple-600 mb-3" />
              <h3 className="font-bold text-gray-950 text-sm">No Location Scraping</h3>
              <p className="text-xs text-gray-650 mt-1 leading-relaxed">
                We only capture your designated apartment building selection to schedule deliveries.
              </p>
            </div>
          </div>

          {/* Details sections */}
          <div className="space-y-6 text-sm text-gray-650 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-500" /> 1. Data Collection & Usage
              </h2>
              <p>
                DailyNest collects minimal personal identifiers (namely, phone number and email address) to set up and manage chapati delivery subscriptions. We do not share customer data with external advertising aggregators.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-500" /> 2. Delivery & Log Files
              </h2>
              <p>
                Delivery schedules and daily logs (skipped days, top-ups) are cached locally in your browser's local store and sent securely to our database server. These records are retained to resolve refunds and wallet billing questions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-500" /> 3. Contacting Us
              </h2>
              <p>
                If you have inquiries regarding privacy defaults or need to clear your profile storage records, reach out directly at <Link href="/contact" className="text-indigo-600 hover:underline">our Contact Page</Link> or email us at support@dailynest.com.
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
            <Link href="/privacy" className="hover:text-indigo-650 font-semibold">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-650">Terms</Link>
            <Link href="/contact" className="hover:text-indigo-650">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
