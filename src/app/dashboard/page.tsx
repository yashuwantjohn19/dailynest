'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { useUser } from '../../hooks/useUser'
import { 
  getMockSubscription, 
  getMockWallet, 
  getMockDeliveries, 
  saveMockDeliveries, 
  getMockApartments 
} from '../../utils/mockDb'
import { Delivery, Apartment } from '../../types/database'
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  HelpCircle, 
  Info, 
  Loader2, 
  MapPin, 
  SkipForward, 
  TrendingUp, 
  User, 
  Wallet 
} from 'lucide-react'

export default function DashboardPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  
  const [wallet, setWallet] = useState<{ balance: number; transactions: any[] }>({ balance: 0, transactions: [] })
  const [subscription, setSubscription] = useState<any | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    const loadDashboardData = () => {
      const activeSub = getMockSubscription()
      const currentWallet = getMockWallet()
      const allDeliveries = getMockDeliveries()
      const aptList = getMockApartments()
      
      setSubscription(activeSub && activeSub.status !== 'cancelled' ? activeSub : null)
      setWallet(currentWallet)
      setDeliveries(allDeliveries)
      setApartments(aptList)
      setLoadingData(false)
    }

    loadDashboardData()

    // Add listeners to reflect updates instantly
    const handleWalletUpdate = () => setWallet(getMockWallet())
    const handleSubscriptionUpdate = () => {
      const activeSub = getMockSubscription()
      setSubscription(activeSub && activeSub.status !== 'cancelled' ? activeSub : null)
    }
    const handleDeliveriesUpdate = () => setDeliveries(getMockDeliveries())

    window.addEventListener('dailynest_wallet_update', handleWalletUpdate)
    window.addEventListener('dailynest_subscription_update', handleSubscriptionUpdate)
    window.addEventListener('dailynest_deliveries_update', handleDeliveriesUpdate)

    return () => {
      window.removeEventListener('dailynest_wallet_update', handleWalletUpdate)
      window.removeEventListener('dailynest_subscription_update', handleSubscriptionUpdate)
      window.removeEventListener('dailynest_deliveries_update', handleDeliveriesUpdate)
    }
  }, [user])

  // Get next scheduled delivery
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const nextDelivery = deliveries.find(d => d.delivery_date >= new Date().toISOString().split('T')[0] && d.status !== 'cancelled')
  
  const handleSkipNext = (deliveryId: string) => {
    if (!confirm('Are you sure you want to skip your next scheduled delivery?')) return
    const updated = deliveries.map(d => {
      if (d.id === deliveryId) {
        return { ...d, status: 'cancelled' as const }
      }
      return d
    })
    saveMockDeliveries(updated)
    setDeliveries(updated)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <Navigation />
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="py-10 flex items-center justify-center min-h-[80vh]">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </main>
        </div>
      </div>
    )
  }

  const apartmentName = subscription 
    ? apartments.find(a => a.id === subscription.apartment_id)?.name 
    : 'Not Set'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navigation />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Page Header */}
            <div className="md:flex md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
                  Welcome back, {user.name || 'Resident'}!
                </h1>
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" /> {apartmentName}
                </p>
              </div>
            </div>

            {/* Grid for Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Wallet Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Wallet Balance</span>
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <div className="my-4">
                  <span className="text-4xl font-extrabold text-gray-900">₹{wallet.balance}</span>
                  <span className="text-xs text-green-600 font-medium block mt-1">Ready for deliveries</span>
                </div>
                <Link
                  href="/wallet"
                  className="w-full text-center py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm block"
                >
                  Top Up Wallet
                </Link>
              </div>

              {/* Subscription Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Active Plan</span>
                  <div className="p-2 rounded-lg bg-green-50 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="my-4">
                  {subscription ? (
                    <>
                      <span className="text-2xl font-bold text-gray-900 capitalize">
                        {subscription.plan} Nest
                      </span>
                      <span className="text-xs text-gray-500 block mt-1 capitalize">
                        {subscription.days_selected.length} Days: {subscription.days_selected.slice(0, 3).join(', ')}...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-gray-400">No active plan</span>
                      <span className="text-xs text-gray-500 block mt-1">Subscribe to get daily deliveries</span>
                    </>
                  )}
                </div>
                <Link
                  href="/subscription"
                  className="w-full text-center py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors block"
                >
                  {subscription ? 'Manage Plan' : 'View Plans'}
                </Link>
              </div>

              {/* Deliveries Count Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Deliveries Scheduled</span>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="my-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {deliveries.filter(d => d.status === 'scheduled').length}
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">Upcoming deliveries next 7 days</span>
                </div>
                <Link
                  href="/calendar"
                  className="w-full text-center py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors block"
                >
                  Open Calendar
                </Link>
              </div>
            </div>

            {/* Next Delivery section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Next Delivery and Recent Transactions */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Next Delivery Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500" /> Next Delivery Status
                  </h3>
                  
                  {nextDelivery ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase">Scheduled Date</div>
                        <div className="text-lg font-bold text-gray-900 mt-0.5">
                          {new Date(nextDelivery.delivery_date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="mt-2 text-sm text-gray-600 flex items-center gap-4">
                          <span>Quantity: <strong>{subscription?.quantity || 4} Chapatis</strong></span>
                          <span>Slot: <strong>6:00 PM - 8:00 PM</strong></span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Scheduled
                        </span>
                        <button
                          onClick={() => handleSkipNext(nextDelivery.id)}
                          className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                          title="Skip this delivery"
                        >
                          <SkipForward className="h-4 w-4 mr-1.5" /> Skip
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No upcoming deliveries scheduled. Ensure your subscription is active and has days selected.
                    </div>
                  )}
                </div>

                {/* Recent Wallet Transactions */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                    <span>Recent Transactions</span>
                    <Link href="/wallet" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">View All</Link>
                  </h3>
                  
                  {wallet.transactions.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm">No transaction records.</div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-my-5 divide-y divide-gray-100">
                        {wallet.transactions.slice(0, 4).map((tx) => (
                          <li key={tx.id} className="py-4 flex items-center justify-between gap-4">
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
                            <div className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                              {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Right 1 Col: Quick Tips & Info */}
              <div className="space-y-6">
                {/* Delivery Notes Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
                    <Info className="h-4 w-4 text-indigo-500" /> Delivery Instructions
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    By default, chapatis are delivered inside a hot-box container hung on your apartment door handle between <strong>6:00 PM and 8:00 PM</strong>.
                  </p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs font-mono text-gray-500 flex justify-between items-center">
                    <span>Default: Door handle</span>
                    <Link href="/subscription" className="text-indigo-600 hover:underline">Edit</Link>
                  </div>
                </div>

                {/* Support Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-3">
                    <HelpCircle className="h-4 w-4 text-green-500" /> Need Help?
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    For any delays, billing discrepancies, or holiday pauses, contact the DailyNest community manager.
                  </p>
                  <a
                    href="mailto:support@dailynest.com"
                    className="mt-4 w-full text-center py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors block"
                  >
                    Email Support
                  </a>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}