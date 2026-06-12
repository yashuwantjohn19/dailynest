'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../../components/Navigation'
import { useUser } from '../../hooks/useUser'
import { 
  getMockSubscription, 
  getMockDeliveries, 
  saveMockDeliveries, 
  updateMockWallet 
} from '../../utils/mockDb'
import { Delivery } from '../../types/database'
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Info, 
  Loader2, 
  MinusCircle, 
  PlusCircle, 
  SkipForward 
} from 'lucide-react'

export default function CalendarPage() {
  const { user, loading } = useUser()
  const router = useRouter()
  
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [subscription, setSubscription] = useState<any | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    setDeliveries(getMockDeliveries())
    setSubscription(getMockSubscription())
  }, [user])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    )
  }

  // Helper values for generating the calendar grid
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 = Sunday, 1 = Monday...
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDelivery(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDelivery(null)
  }

  // Generate calendar days
  const calendarDays: (Date | null)[] = []
  
  // Fill initial offset blanks
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // Fill calendar days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(year, month, i))
  }

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const delivery = deliveries.find(d => d.delivery_date === dateStr)
    
    if (delivery) {
      setSelectedDelivery(delivery)
    } else {
      // Check if this weekday is part of the subscription
      const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const weekday = weekdays[date.getDay()]
      const isSubscribedDay = subscription && subscription.days_selected.includes(weekday) && subscription.status !== 'cancelled'
      
      if (isSubscribedDay) {
        // Create a new delivery record if it's a subscription day but has no record (e.g. dynamic rendering)
        const newDel: Delivery = {
          id: `del-${dateStr}`,
          subscription_id: subscription.id,
          delivery_date: dateStr,
          status: 'scheduled',
          meal_type: 'Dinner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setSelectedDelivery(newDel)
      } else {
        setSelectedDelivery({
          id: `non-sub-${dateStr}`,
          subscription_id: '',
          delivery_date: dateStr,
          status: 'cancelled', // representing unscheduled
          meal_type: 'N/A',
          created_at: '',
          updated_at: ''
        })
      }
    }
    setSuccessMsg(null)
  }

  const handleSkipDay = (delivery: Delivery) => {
    if (!subscription) return
    const dateStr = delivery.delivery_date
    const amountRefund = subscription.plan === 'family' ? 60 : (subscription.plan === 'premium' ? 45 : 35)

    let updatedDeliveries: Delivery[] = []
    const exists = deliveries.some(d => d.delivery_date === dateStr)

    if (exists) {
      updatedDeliveries = deliveries.map(d => {
        if (d.delivery_date === dateStr) {
          return { ...d, status: 'cancelled' as const }
        }
        return d
      })
    } else {
      // Append a cancelled delivery record
      updatedDeliveries = [
        ...deliveries,
        {
          ...delivery,
          status: 'cancelled' as const
        }
      ]
    }

    saveMockDeliveries(updatedDeliveries)
    setDeliveries(updatedDeliveries)
    
    // Refund money to wallet
    updateMockWallet(amountRefund, 'credit', `Delivery Refund: Skipped ${dateStr}`)
    
    setSelectedDelivery({
      ...delivery,
      status: 'cancelled'
    })
    setSuccessMsg(`Delivery skipped! ₹${amountRefund} refunded to your wallet.`)
  }

  const handleResumeDay = (delivery: Delivery) => {
    if (!subscription) return
    const dateStr = delivery.delivery_date
    const amountCharge = subscription.plan === 'family' ? 60 : (subscription.plan === 'premium' ? 45 : 35)
    
    let updatedDeliveries: Delivery[] = []
    const exists = deliveries.some(d => d.delivery_date === dateStr)

    if (exists) {
      updatedDeliveries = deliveries.map(d => {
        if (d.delivery_date === dateStr) {
          return { ...d, status: 'scheduled' as const }
        }
        return d
      })
    } else {
      updatedDeliveries = [
        ...deliveries,
        {
          ...delivery,
          status: 'scheduled' as const
        }
      ]
    }

    saveMockDeliveries(updatedDeliveries)
    setDeliveries(updatedDeliveries)
    
    // Deduct money from wallet
    updateMockWallet(amountCharge, 'debit', `Delivery Resumed: Scheduled ${dateStr}`)
    
    setSelectedDelivery({
      ...delivery,
      status: 'scheduled'
    })
    setSuccessMsg(`Delivery resumed successfully! Charged ₹${amountCharge} to wallet.`)
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
                  Delivery Calendar
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Track upcoming deliveries, pause specific days, and claim instant wallet refunds.
                </p>
              </div>
            </div>

            {/* Notification messages */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <span className="text-sm font-medium">{successMsg}</span>
              </div>
            )}

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar grid wrapper */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                
                {/* Calendar Header Controls */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    {monthNames[month]} {year}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Days of Week Row */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 uppercase mb-4">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, idx) => {
                    if (!date) {
                      return <div key={`empty-${idx}`} className="h-16 md:h-20 bg-gray-50/50 rounded-lg" />
                    }

                    const dateStr = date.toISOString().split('T')[0]
                    const delivery = deliveries.find(d => d.delivery_date === dateStr)
                    const isToday = date.toDateString() === new Date().toDateString()
                    
                    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                    const weekday = weekdays[date.getDay()]
                    const isSubscribedDay = subscription && subscription.days_selected.includes(weekday) && subscription.status !== 'cancelled'
                    
                    // Determine state colors
                    let cellStyle = "bg-white border border-gray-200 hover:border-indigo-500"
                    let badgeColor = ""
                    let statusLabel = ""

                    if (delivery) {
                      if (delivery.status === 'scheduled') {
                        cellStyle = "bg-green-50/70 border border-green-200 hover:border-green-400 cursor-pointer"
                        badgeColor = "bg-green-500"
                        statusLabel = "Scheduled"
                      } else if (delivery.status === 'delivered') {
                        cellStyle = "bg-blue-50/40 border border-blue-200 hover:border-blue-400 cursor-pointer"
                        badgeColor = "bg-blue-500"
                        statusLabel = "Delivered"
                      } else if (delivery.status === 'cancelled') {
                        cellStyle = "bg-red-50/30 border border-red-150 hover:border-red-300 cursor-pointer"
                        badgeColor = "bg-red-400"
                        statusLabel = "Skipped"
                      }
                    } else if (isSubscribedDay) {
                      // Subscribed day, but no explicit Delivery record generated yet
                      cellStyle = "bg-green-50/70 border border-green-200 hover:border-green-400 cursor-pointer"
                      badgeColor = "bg-green-500"
                      statusLabel = "Scheduled"
                    }

                    if (isToday) {
                      cellStyle += " ring-2 ring-indigo-500"
                    }

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDayClick(date)}
                        className={`h-16 md:h-20 p-2 rounded-lg flex flex-col justify-between items-start transition-all relative ${cellStyle}`}
                      >
                        <span className={`text-sm font-semibold ${isToday ? 'text-indigo-600 font-extrabold' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </span>
                        
                        {statusLabel && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${badgeColor}`} />
                            <span className="text-[10px] font-medium text-gray-500 hidden sm:inline">{statusLabel}</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

              </div>

              {/* Sidebar Action Panel */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-indigo-500" /> Day Details
                  </h3>

                  {selectedDelivery ? (
                    <div className="space-y-6">
                      <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase">Selected Date</div>
                        <div className="text-base font-bold text-gray-900 mt-1">
                          {new Date(selectedDelivery.delivery_date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>

                      {/* Display delivery properties */}
                      {selectedDelivery.subscription_id ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-semibold text-gray-400">Meal Type</div>
                              <div className="text-sm font-medium text-gray-900 mt-0.5">{selectedDelivery.meal_type || 'Dinner'}</div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-400">Quantity</div>
                              <div className="text-sm font-medium text-gray-900 mt-0.5">{subscription?.quantity || 4} Chapatis</div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-gray-400">Delivery Status</div>
                            <div className="mt-1">
                              {selectedDelivery.status === 'scheduled' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  Scheduled
                                </span>
                              )}
                              {selectedDelivery.status === 'delivered' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  Delivered
                                </span>
                              )}
                              {selectedDelivery.status === 'cancelled' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                  Skipped / Paused
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick info about skip refund */}
                          {selectedDelivery.status === 'scheduled' && (
                            <div className="p-3.5 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800 flex gap-2">
                              <Info className="h-4 w-4 flex-shrink-0 text-yellow-600" />
                              <span>
                                Skipping this day will instantly credit <strong>₹{subscription?.plan === 'family' ? 60 : (subscription?.plan === 'premium' ? 45 : 35)}</strong> to your wallet.
                              </span>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-4">
                            {selectedDelivery.status === 'scheduled' && (
                              <button
                                onClick={() => handleSkipDay(selectedDelivery)}
                                className="w-full flex items-center justify-center py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors"
                              >
                                <MinusCircle className="h-4 w-4 mr-2" /> Skip Delivery
                              </button>
                            )}

                            {selectedDelivery.status === 'cancelled' && (
                              <button
                                onClick={() => handleResumeDay(selectedDelivery)}
                                className="w-full flex items-center justify-center py-2.5 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" /> Resume Delivery
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="p-3 bg-gray-50 border border-gray-150 rounded-lg text-xs text-gray-600">
                          This is not a designated delivery day in your subscription schedule. To add this day permanently, modify your plan in the <a href="/subscription" className="text-indigo-600 hover:underline">Subscription Settings</a>.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      Select a delivery day on the grid to view details and options.
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-gray-400" /> Need custom schedule adjustments? Reach out to support.
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}