'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, CheckCircle, Send, ArrowLeft, Clock } from 'lucide-react'

export default function ContactPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setName('')
      setEmail('')
      setMessage('')
    }, 1000)
  }

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
              <Link href="/" className="text-gray-600 hover:text-indigo-655 font-medium">Home</Link>
              <Link href="/subscription" className="text-gray-600 hover:text-indigo-655 font-medium">Subscription</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-indigo-655 font-medium">Dashboard</Link>
              <Link href="/admin" className="text-gray-600 hover:text-indigo-655 font-medium">Admin</Link>
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-6 gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Grid Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Info Card */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-xl p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Get in Touch
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Have questions about custom plans or apartment eligibility? We're here to help Chennai residents.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-650 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-950 text-sm">Chennai Kitchen Headquarters</h4>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Door No. 12, Navalur Main Road, OMR Area,<br />
                    Egattur, Chennai, Tamil Nadu - 600130
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 text-green-650 rounded-xl">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-955 text-sm">Email Support</h4>
                  <p className="text-xs text-indigo-600 mt-1">
                    <a href="mailto:support@dailynest.com" className="hover:underline">support@dailynest.com</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-650 rounded-xl">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-955 text-sm">Helpline Support</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    +91 44 2490 8820 (10:00 AM - 6:00 PM IST)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 text-purple-650 rounded-xl">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-955 text-sm">Standard Delivery Hours</h4>
                  <p className="text-xs text-gray-650 mt-1">
                    Daily delivery occurs from 6:00 PM to 8:00 PM.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-xl p-8">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900">Message Received!</h3>
                <p className="text-sm text-gray-550 max-w-sm mx-auto">
                  Thank you for reaching out. A DailyNest Chennai supervisor will contact you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-sm transition-colors shadow-sm"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3">
                  Submit a Query
                </h3>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-750">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yashuwant John"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-750">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. resident@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-750">Inquiry Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your questions or custom plan suggestions here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center py-3.5 border border-transparent rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors gap-1.5 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : (
                    <>
                      <Send className="h-4 w-4" /> Send Inquiry Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div>DailyNest © 2026</div>
          <div className="flex items-center space-x-4 mt-3 md:mt-0">
            <Link href="/privacy" className="hover:text-indigo-650">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-650">Terms</Link>
            <Link href="/contact" className="hover:text-indigo-650 font-semibold">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
