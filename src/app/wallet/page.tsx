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
  Loader2, 
  Plus, 
  ShieldCheck, 
  Smartphone, 
  TrendingUp, 
  Wallet,
  Lock,
  QrCode,
  AlertCircle,
  Building2,
  Check
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

  // Payment Authenticator Modal State
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authState, setAuthState] = useState<'qr' | 'otp' | 'netbank' | 'success'>('qr')
  const [otpVal, setOtpVal] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  
  const [selectedBankName, setSelectedBankName] = useState('State Bank of India')
  const [bankUsername, setBankUsername] = useState('')
  const [bankPassword, setBankPassword] = useState('')

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

    setErrorMsg(null)
    setSuccessMsg(null)
    setAuthError(null)

    // Launch correct authentication modal state
    if (paymentMethod === 'upi') {
      setAuthState('qr')
    } else if (paymentMethod === 'card') {
      setAuthState('otp')
      setOtpVal('')
    } else {
      setAuthState('netbank')
      setBankUsername('')
      setBankPassword('')
    }

    setShowAuthModal(true)
  }

  const handleConfirmAuthentication = () => {
    setSubmitting(true)
    setAuthError(null)

    // Simulate secure network transaction delay
    setTimeout(() => {
      // Basic mock credentials check
      if (authState === 'otp' && otpVal.trim() !== '123456' && otpVal.trim() !== '') {
        setAuthError('Incorrect OTP code. Enter 123456 or leave blank to auto-confirm.')
        setSubmitting(false)
        return
      }

      if (authState === 'netbank' && (!bankUsername.trim() || !bankPassword.trim())) {
        setAuthError('Please fill out your Netbanking credentials.')
        setSubmitting(false)
        return
      }

      const methodLabel = paymentMethod === 'upi' ? 'UPI' : (paymentMethod === 'card' ? 'Card' : 'Netbanking')
      const rechargeAmount = Number(amount)

      const { balance: newBalance, transactions: newTxs } = updateMockWallet(
        rechargeAmount, 
        'credit', 
        `Wallet top-up (${methodLabel} - Secure Authenticated)`
      )

      setBalance(newBalance)
      setTransactions(newTxs)
      setAuthState('success')
      setSubmitting(false)

      // Close modal on success completion
      setTimeout(() => {
        setShowAuthModal(false)
        setSuccessMsg(`Successfully credited ₹${rechargeAmount} to your wallet!`)
      }, 1500)

    }, 1500)
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
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-55'
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
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-55'
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
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-55'
                          }`}
                        >
                          <Smartphone className="h-4 w-4" /> Net Banking
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center py-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      Secure Recharge Wallet ₹{amount}
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

            {/* Payment Authenticator Modal Overlay */}
            {showAuthModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
                <div className="bg-white rounded-3xl border border-gray-150 shadow-2xl w-full max-w-md overflow-hidden">
                  
                  {/* Gateway Header */}
                  <div className="px-6 py-4 bg-indigo-700 text-white flex items-center justify-between border-b border-indigo-800">
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-indigo-350" />
                      <span className="text-xs font-bold uppercase tracking-wider">3D-Secure Authenticator</span>
                    </div>
                    <button 
                      onClick={() => setShowAuthModal(false)} 
                      disabled={submitting}
                      className="text-indigo-200 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Warning banner */}
                  {authError && (
                    <div className="bg-red-50 p-3 border-b border-red-150 text-xs text-red-700 flex gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Modal Body */}
                  <div className="p-6">

                    {/* QR Code view */}
                    {authState === 'qr' && (
                      <div className="text-center space-y-4">
                        <h3 className="font-bold text-gray-900 text-base">Scan UPI QR Code to Pay</h3>
                        <p className="text-xs text-gray-500">
                          Scan using GPay, PhonePe, Paytm or any BHIM UPI app on your mobile to complete authentication.
                        </p>
                        
                        <div className="mx-auto w-48 h-48 bg-gradient-to-tr from-indigo-50 to-green-50 border border-gray-200 rounded-2xl flex items-center justify-center relative p-3">
                          <QrCode className="h-full w-full text-indigo-800" />
                          <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[0.5px]">
                            <span className="text-xs font-black text-indigo-900 bg-white/90 px-3 py-1 rounded-full border border-indigo-200 shadow-sm animate-pulse">
                              ₹{amount}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={handleConfirmAuthentication}
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors gap-2"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4" /> Authenticating...
                              </>
                            ) : (
                              <>Simulate QR Scan & Approve Payment</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card OTP view */}
                    {authState === 'otp' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900 text-base">One-Time Password Verification</h3>
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          A 6-digit confirmation PIN has been sent by your bank to your registered mobile phone ending in *4321.
                        </p>

                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Enter 6-digit code (e.g. 123456)"
                            maxLength={6}
                            value={otpVal}
                            onChange={(e) => setOtpVal(e.target.value)}
                            className="block w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-center font-bold text-lg tracking-[0.2em]"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">
                            * Enter <strong>123456</strong> or leave blank to successfully authenticate.
                          </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={handleConfirmAuthentication}
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors gap-2"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4" /> Verifying Code...
                              </>
                            ) : (
                              <>Verify & Authorize Payment (₹{amount})</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Netbanking Login view */}
                    {authState === 'netbank' && (
                      <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 text-base">Net Banking Gateway</h3>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Select Bank</label>
                            <select
                              value={selectedBankName}
                              onChange={(e) => setSelectedBankName(e.target.value)}
                              className="block w-full rounded-xl border border-gray-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm font-medium"
                            >
                              <option>State Bank of India</option>
                              <option>HDFC Bank</option>
                              <option>ICICI Bank</option>
                              <option>Axis Bank</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Online User ID</label>
                            <input
                              type="text"
                              required
                              placeholder="Enter Netbanking Customer ID"
                              value={bankUsername}
                              onChange={(e) => setBankUsername(e.target.value)}
                              className="block w-full border border-gray-300 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase">Password</label>
                            <input
                              type="password"
                              required
                              placeholder="Enter Secure Password"
                              value={bankPassword}
                              onChange={(e) => setBankPassword(e.target.value)}
                              className="block w-full border border-gray-300 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={handleConfirmAuthentication}
                            disabled={submitting}
                            className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors gap-2"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="animate-spin h-4 w-4" /> Connecting to Bank...
                              </>
                            ) : (
                              <>Authorize Login & Pay (₹{amount})</>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Success notification view */}
                    {authState === 'success' && (
                      <div className="text-center py-6 space-y-4">
                        <div className="h-16 w-16 bg-green-50 border-2 border-green-400 rounded-full flex items-center justify-center text-green-500 mx-auto animate-bounce">
                          <Check className="h-8 w-8 stroke-[3]" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-gray-900 text-lg">Transaction Authenticated!</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Your payment has been successfully verified. Credits are added to your wallet.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* PCI DSS footer */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center flex items-center justify-center gap-1 text-[10px] text-gray-400">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Secure PCI-DSS Compliant 256-bit encryption.
                  </div>

                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}