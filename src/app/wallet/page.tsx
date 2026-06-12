'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../../components/Navigation'
import { useUser } from '../../hooks/useUser'
import { getMockWallet, updateMockWallet } from '../../utils/mockDb'
import { WalletTransaction } from '../../types/database'
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  CreditCard, 
  DollarSign, 
  Loader2, 
  Plus, 
  ShieldCheck, 
  Smartphone, 
  TrendingUp, 
  Wallet 
} from 'lucide-react'

export default function WalletPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  
  // Recharge Form State
  const [amount, setAmount] = useState('500')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    const { balance: bal, transactions: txs } = getMockWallet()
    setBalance(bal)
    setTransactions(txs)
  }, [user])

  const handleQuickRecharge = (value: number) => {
    setAmount(String(value))
  }

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const rechargeAmount = Number(amount)
    
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      setErrorMsg('Please enter a valid amount.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    // Simulate payment gateway delay
    setTimeout(() => {
      const methodLabel = paymentMethod === 'upi' ? 'UPI' : (paymentMethod === 'card' ? 'Card' : 'Netbanking')
      const { balance: newBalance, transactions: newTxs } = updateMockWallet(
        rechargeAmount, 
        'credit', 
        `Wallet top-up (${methodLabel})`
      )
      
      setBalance(newBalance)
      setTransactions(newTxs)
      setSuccessMsg(`Successfully recharged ₹${rechargeAmount}!`)
      setSubmitting(false)
    }, 1200)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navigation />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                  DailyNest Wallet
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Pre-fund your daily deliveries, check transactions, and set up quick recharges.
                </p>
              </div>
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
                <span className="text-sm font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Cols: Wallet Recharge Card and Transactions */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Balance Display Block */}
                <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <span className="text-sm text-indigo-200 font-medium">Available Balance</span>
                    <h2 className="text-5xl font-extrabold mt-2 tracking-tight">₹{balance}</h2>
                    
                    <div className="flex items-center gap-4 mt-6 text-xs text-indigo-100">
                      <span className="flex items-center gap-1 bg-indigo-800/60 px-3 py-1.5 rounded-full border border-indigo-700/50">
                        <ShieldCheck className="h-4 w-4 text-green-400" /> Secure Payments
                      </span>
                      <span className="flex items-center gap-1 bg-indigo-800/60 px-3 py-1.5 rounded-full border border-indigo-700/50">
                        <TrendingUp className="h-4 w-4 text-indigo-300" /> Instant Refund Skipped Days
                      </span>
                    </div>
                  </div>
                  
                  {/* Subtle decorative background blur shapes */}
                  <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-8 pointer-events-none">
                    <Wallet className="h-64 w-64 rotate-12 translate-x-12 translate-y-8" />
                  </div>
                </div>

                {/* Recharge Card Form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-indigo-500" /> Quick Add Money
                  </h3>

                  <form onSubmit={handleRechargeSubmit} className="space-y-6">
                    {/* Quick amount suggestions */}
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-gray-400 uppercase">Select Preset Amount</span>
                      <div className="grid grid-cols-3 gap-3">
                        {[200, 500, 1000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleQuickRecharge(val)}
                            className={`py-3 rounded-lg border font-bold text-sm transition-all ${
                              amount === String(val)
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            +₹{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Input */}
                    <div className="space-y-2">
                      <label htmlFor="custom-amount" className="block text-xs font-semibold text-gray-400 uppercase">
                        Or Enter Custom Amount (₹)
                      </label>
                      <input
                        type="number"
                        id="custom-amount"
                        required
                        min="1"
                        placeholder="Enter amount (e.g. 350)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 font-semibold"
                      />
                    </div>

                    {/* Payment methods */}
                    <div className="space-y-2">
                      <span className="block text-xs font-semibold text-gray-400 uppercase">Select Payment Method</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('upi')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                            paymentMethod === 'upi'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Smartphone className="h-4 w-4" /> UPI (GPay/PhonePe)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                            paymentMethod === 'card'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <CreditCard className="h-4 w-4" /> Credit / Debit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('netbanking')}
                          className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-semibold transition-all ${
                            paymentMethod === 'netbanking'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Smartphone className="h-4 w-4" /> Net Banking
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Processing Security Checkout...
                        </>
                      ) : (
                        `Recharge Wallet ₹${amount}`
                      )}
                    </button>
                  </form>
                </div>

              </div>

              {/* Right 1 Col: Transactions Ledger */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
                  Transactions Ledger
                </h3>

                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    No recent transaction logs.
                  </div>
                ) : (
                  <div className="flow-root max-h-[500px] overflow-y-auto pr-1">
                    <ul className="-my-5 divide-y divide-gray-100">
                      {transactions.map((tx) => (
                        <li key={tx.id} className="py-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {tx.type === 'credit' ? (
                              <div className="p-2 rounded-lg bg-green-50 text-green-600 flex-shrink-0">
                                <ArrowDownLeft className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-gray-50 text-gray-600 flex-shrink-0">
                                <ArrowUpRight className="h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{tx.description}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(tx.created_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className={`text-sm font-bold flex-shrink-0 ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}