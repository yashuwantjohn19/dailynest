"use client"

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="w-full bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-extrabold text-indigo-600">DailyNest</Link>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
              <Link href="/subscription" className="text-gray-700 hover:text-indigo-600">Subscription</Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
              <Link href="/admin" className="text-gray-700 hover:text-indigo-600">Admin</Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Login
                </Link>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label="Toggle menu"
                  aria-expanded={mobileOpen}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
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
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-4 pb-4 space-y-2">
              <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Home</Link>
              <Link href="/subscription" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Subscription</Link>
              <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Dashboard</Link>
              <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Admin</Link>
              <Link href="/login" className="block px-3 py-2 mt-1 rounded-md text-base font-medium bg-indigo-600 text-white text-center">Login</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <section className="min-h-[70vh] flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                  Fresh Chapatis Delivered Daily to Your Apartment
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-xl">
                  Simple subscription-based delivery designed for apartment communities across Chennai.
                </p>

                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    href="/subscription"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-indigo-600 text-white text-base font-medium hover:bg-indigo-700"
                  >
                    Start Subscription
                  </Link>

                  <Link
                    href="/subscription"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-gray-200 bg-white text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Plans
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="h-48 rounded-lg bg-gradient-to-r from-indigo-100 to-indigo-50 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-lg">DailyNest — Chennai</span>
                  </div>
                  <div className="mt-6 text-sm text-gray-600">
                    <p>
                      Trusted by apartment communities — dependable delivery, flexible schedules, and easy wallet payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">Features</h2>
            <p className="text-center text-gray-600 mt-2 max-w-2xl mx-auto">Everything you need to manage daily meal deliveries for your apartment community.</p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <article className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Apartment-level delivery</h3>
                <p className="mt-2 text-gray-600">Deliver to individual apartments with care and timely schedules tailored for your community.</p>
              </article>

              <article className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Flexible subscription calendar</h3>
                <p className="mt-2 text-gray-600">Pause, resume or customize deliveries using an intuitive calendar interface.</p>
              </article>

              <article className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Wallet-based payments</h3>
                <p className="mt-2 text-gray-600">Top up your wallet and pay seamlessly when deliveries are processed.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="py-16 bg-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">Join DailyNest and simplify your daily meals</h2>
            <p className="mt-3 text-indigo-100">Enjoy fresh chapatis delivered every day — hassle-free.</p>
            <div className="mt-6">
              <Link href="/subscription" className="inline-flex items-center px-6 py-3 rounded-md bg-white text-indigo-600 font-semibold hover:bg-gray-100">
                Subscribe Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-sm">
          <div className="text-gray-600">DailyNest © 2026</div>
          <div className="flex items-center space-x-4 mt-3 md:mt-0">
            <Link href="/privacy" className="text-gray-600 hover:text-indigo-600">Privacy</Link>
            <Link href="/terms" className="text-gray-600 hover:text-indigo-600">Terms</Link>
            <Link href="/contact" className="text-gray-600 hover:text-indigo-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
