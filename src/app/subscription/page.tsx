'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'
import { useUser } from '../../hooks/useUser'
import { 
  getMockApartments, 
  getMockSubscription, 
  saveMockSubscription, 
  updateMockWallet 
} from '../../utils/mockDb'
import { Apartment } from '../../types/database'
import { 
  Calendar, 
  Check, 
  CheckCircle, 
  ChevronRight, 
  CreditCard, 
  Loader2, 
  MapPin, 
  Pause, 
  Play, 
  Plus, 
  Settings, 
  Sparkles, 
  Trash2 
} from 'lucide-react'

interface Plan {
  id: 'basic' | 'premium' | 'family'
  name: string
  price: number
  description: string
  mealsPerWeek: number
  features: string[]
}

const PLANS: Plan[] = [
  { 
    id: 'basic', 
    name: 'Basic Nest', 
    price: 399, 
    description: 'Perfect for light eaters or single professionals',
    mealsPerWeek: 3, 
    features: ['3 deliveries per week', '2 chapatis per delivery', 'Flexible day pausing', 'Free delivery'] 
  },
  { 
    id: 'premium', 
    name: 'Premium Nest', 
    price: 699, 
    description: 'Most popular plan for couples and small apartments',
    mealsPerWeek: 5, 
    features: ['5 deliveries per week', '4 chapatis per delivery', 'Flexible day pausing', 'Priority evening delivery', 'Rollover chapatis'] 
  },
  { 
    id: 'family', 
    name: 'Family Nest', 
    price: 1199, 
    description: 'Designed for active families and healthy appetites',
    mealsPerWeek: 7, 
    features: ['Daily delivery (7 days/week)', '6 chapatis per delivery', 'Flexible day pausing', 'Priority evening delivery', 'Custom delivery slot preference'] 
  }
]

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
]

export default function SubscriptionPage() {
  const { user, loading } = useUser()
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [activeSub, setActiveSub] = useState<any | null>(null)
  
  // Form State
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'family'>('premium')
  const [selectedApartment, setSelectedApartment] = useState('')
  const [quantity, setQuantity] = useState(4)
  const [selectedDays, setSelectedDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    // Load apartments
    const fetchApartments = async () => {
      try {
        const res = await fetch('/api/apartments/list')
        const data = await res.json()
        if (res.ok && data.apartments && data.apartments.length > 0) {
          setApartments(data.apartments)
          setSelectedApartment(data.apartments[0].id)
        } else {
          const mockApts = getMockApartments()
          setApartments(mockApts)
          setSelectedApartment(mockApts[0].id)
        }
      } catch {
        const mockApts = getMockApartments()
        setApartments(mockApts)
        setSelectedApartment(mockApts[0].id)
      }
    }

    fetchApartments()
    
    // Load active subscription
    const subscription = getMockSubscription()
    if (subscription && subscription.status !== 'cancelled') {
      setActiveSub(subscription)
    }
  }, [user])

  const handleDayToggle = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId) 
        : [...prev, dayId]
    )
  }

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (selectedDays.length === 0) {
      setErrorMsg('Please select at least one delivery day.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan,
          mealsPerWeek: selectedDays.length,
          startDate,
          apartmentId: selectedApartment,
          quantity,
          daysSelected: selectedDays
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Success
      const planCost = PLANS.find(p => p.id === selectedPlan)?.price || 0
      updateMockWallet(planCost, 'debit', `Subscription Plan Setup: ${selectedPlan.toUpperCase()}`)
      
      const newSub = {
        id: data.subscription.id,
        user_id: user.id,
        apartment_id: selectedApartment,
        plan: selectedPlan,
        meals_per_week: selectedDays.length,
        quantity,
        start_date: startDate,
        status: 'active',
        days_selected: selectedDays,
        paused: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      saveMockSubscription(newSub as any)
      setActiveSub(newSub)
      setSuccessMsg('Subscription created successfully!')
    } catch (err: any) {
      console.warn('Real subscription endpoint failed, creating in mock storage:', err)
      
      // Fallback Mock Creation
      const planObj = PLANS.find(p => p.id === selectedPlan)
      const planCost = planObj?.price || 0
      
      updateMockWallet(planCost, 'debit', `Subscription Setup: ${planObj?.name}`)
      
      const mockSub = {
        id: `sub-${Date.now()}`,
        user_id: user.id,
        apartment_id: selectedApartment,
        plan: selectedPlan,
        meals_per_week: selectedDays.length,
        quantity,
        start_date: startDate,
        status: 'active',
        days_selected: selectedDays,
        paused: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      saveMockSubscription(mockSub as any)
      setActiveSub(mockSub)
      setSuccessMsg('Subscription created successfully (Dev Mock)!')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePause = async () => {
    if (!activeSub) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/subscriptions/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: activeSub.id })
      })
      if (!res.ok) throw new Error()
      
      const updated = { ...activeSub, paused: true, status: 'paused' }
      saveMockSubscription(updated)
      setActiveSub(updated)
      setSuccessMsg('Subscription paused successfully.')
    } catch {
      const updated = { ...activeSub, paused: true, status: 'paused' }
      saveMockSubscription(updated)
      setActiveSub(updated)
      setSuccessMsg('Subscription paused successfully (Dev Mock).')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResume = async () => {
    if (!activeSub) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/subscriptions/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: activeSub.id })
      })
      if (!res.ok) throw new Error()
      
      const updated = { ...activeSub, paused: false, status: 'active' }
      saveMockSubscription(updated)
      setActiveSub(updated)
      setSuccessMsg('Subscription resumed successfully.')
    } catch {
      const updated = { ...activeSub, paused: false, status: 'active' }
      saveMockSubscription(updated)
      setActiveSub(updated)
      setSuccessMsg('Subscription resumed successfully (Dev Mock).')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (!confirm('Are you sure you want to cancel your DailyNest subscription? This will cancel all future deliveries.')) return
    
    saveMockSubscription(null)
    localStorage.removeItem('dailynest_mock_deliveries')
    setActiveSub(null)
    setSuccessMsg('Subscription cancelled successfully.')
  }

  if (loading) {
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
                  Subscription Plans
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Select, configure or modify your daily meals plan.
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

            {/* Unauthenticated flow */}
            {!user ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 text-center max-w-xl mx-auto mt-12">
                <Calendar className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscribe to DailyNest</h2>
                <p className="text-gray-600 mb-6">
                  Log in to set up a recurring delivery schedule, manage your apartment settings, and credit your payment wallet.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Log In to Continue
                </Link>
              </div>
            ) : activeSub ? (
              
              /* Active subscription management UI */
              <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 md:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                          {activeSub.plan} Plan
                        </span>
                        {activeSub.paused ? (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                            Paused
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                            Active
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mt-2">Your Active Subscription</h2>
                      <p className="text-sm text-gray-500 mt-1">ID: {activeSub.id}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {activeSub.paused ? (
                        <button
                          onClick={handleResume}
                          disabled={submitting}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                          Resume Delivery
                        </button>
                      ) : (
                        <button
                          onClick={handlePause}
                          disabled={submitting}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
                          Pause Delivery
                        </button>
                      )}
                      
                      <button
                        onClick={handleCancel}
                        disabled={submitting}
                        className="inline-flex items-center px-4 py-2 border border-red-200 rounded-lg bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">Deliveries Schedule</div>
                      <div className="text-base font-semibold text-gray-900 capitalize">
                        {activeSub.days_selected.length} Days / Week
                      </div>
                      <div className="text-xs text-gray-500">
                        {activeSub.days_selected.join(', ')}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">Quantity per Delivery</div>
                      <div className="text-base font-semibold text-gray-900">
                        {activeSub.quantity} Chapatis
                      </div>
                      <div className="text-xs text-gray-500">
                        Serves approx. {Math.ceil(activeSub.quantity / 2)} people
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-500">Apartment Address</div>
                      <div className="text-base font-semibold text-gray-900">
                        {apartments.find(a => a.id === activeSub.apartment_id)?.name || 'Your Registered Apartment'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Start Date: {activeSub.start_date}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotional banner or details */}
                <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                  <div className="relative z-10 max-w-xl">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-300" />
                      Manage with ease!
                    </h3>
                    <p className="mt-2 text-sm text-indigo-100">
                      Need to skip a single delivery day instead of pausing the whole subscription? Go to the <Link href="/calendar" className="underline font-bold text-white hover:text-indigo-200">Calendar View</Link> to toggle specific days!
                    </p>
                  </div>
                  <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center pr-8 pointer-events-none">
                    <Settings className="h-48 w-48 animate-[spin_60s_linear_infinite]" />
                  </div>
                </div>
              </div>
            ) : (
              
              /* Subscription Setup Form */
              <form onSubmit={handleCreateSubscription} className="space-y-10">
                {/* Step 1: Plan Selector */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Choose a Nesting Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`relative rounded-2xl p-6 cursor-pointer border-2 transition-all flex flex-col justify-between ${
                          selectedPlan === plan.id
                            ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                            {selectedPlan === plan.id && (
                              <span className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-4 flex items-baseline">
                            <span className="text-3xl font-extrabold text-gray-900">₹{plan.price}</span>
                            <span className="ml-1 text-sm text-gray-500">/month</span>
                          </div>
                          
                          <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                          
                          <ul className="mt-6 space-y-2 border-t border-gray-100 pt-4">
                            {plan.features.map((feat, i) => (
                              <li key={i} className="flex items-center text-xs text-gray-600">
                                <Check className="h-3.5 w-3.5 text-indigo-500 mr-2 flex-shrink-0" />
                                {feat}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 2: Delivery Details */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-md space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">2. Delivery Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Apartment selection */}
                    <div className="space-y-2">
                      <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-gray-400" /> Apartment Building
                      </label>
                      <select
                        id="apartment"
                        value={selectedApartment}
                        onChange={(e) => setSelectedApartment(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      >
                        {apartments.map((apt) => (
                          <option key={apt.id} value={apt.id}>
                            {apt.name} ({apt.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                      <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" /> Start Date
                      </label>
                      <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">Chapatis per Delivery</label>
                      <span className="text-xs text-gray-500">Serves approx. {Math.ceil(quantity / 2)} people</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.max(2, q - 2))}
                        className="h-11 w-11 rounded-lg border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(q => Math.min(20, q + 2))}
                        className="h-11 w-11 rounded-lg border border-gray-300 flex items-center justify-center font-bold text-lg hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Day Picker */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-sm font-medium text-gray-700">Select Delivery Days</label>
                    <div className="flex flex-wrap gap-3">
                      {DAYS_OF_WEEK.map((day) => {
                        const isSelected = selectedDays.includes(day.id)
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => handleDayToggle(day.id)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {day.label}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Billing adjusts automatically based on the number of days you select.
                    </p>
                  </div>
                </div>

                {/* Form Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent rounded-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Setting Up...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Confirm & Start Subscription (₹{PLANS.find(p => p.id === selectedPlan)?.price || 0}/mo)
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}