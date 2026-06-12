'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navigation'
import { getMockSubscription, getMockWallet, getMockApartments } from '../../../utils/mockDb'
import { 
  Users, 
  Search, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  MapPin,
  Plus,
  Loader2
} from 'lucide-react'

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  plan: string
  quantity: number
  apartmentName: string
  walletBalance: number
  status: 'active' | 'paused' | 'inactive'
  daysSelected: string[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Wallet Adjuster Modal State
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState('500')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    // Collect customer data based on mock settings & localstorage
    const storedUser = localStorage.getItem('dailynest_mock_user')
    const parsedUser = storedUser ? JSON.parse(storedUser) : null
    
    const sub = getMockSubscription()
    const wallet = getMockWallet()
    const apartments = getMockApartments()
    
    // Assemble mock customer registry
    const defaultCusts: Customer[] = []
    
    // Active simulated resident (either logged in user or default mock)
    if (parsedUser || sub) {
      const activeApt = sub ? apartments.find(a => a.id === sub.apartment_id)?.name : 'Olympia Opaline, Navalur'
      defaultCusts.push({
        id: parsedUser?.id || 'user-mock-123',
        name: parsedUser?.name || 'Yashuwant Vijay',
        phone: parsedUser?.phone || '+91 98765 43210',
        email: parsedUser?.email || 'yashuwant@dailynest.com',
        plan: sub?.plan || 'premium',
        quantity: sub?.quantity || 4,
        apartmentName: activeApt || 'Olympia Opaline, Navalur',
        walletBalance: wallet.balance,
        status: sub?.paused ? 'paused' : (sub ? 'active' : 'inactive'),
        daysSelected: sub?.days_selected || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      })
    }
    
    // Add additional mock customers to populate table beautifully
    defaultCusts.push({
      id: 'cust-2',
      name: 'Aditi Sundaram',
      phone: '+91 98402 12345',
      email: 'aditi.s@gmail.com',
      plan: 'family',
      quantity: 6,
      apartmentName: 'Hiranandani Birchwood, Egattur',
      walletBalance: 2450,
      status: 'active',
      daysSelected: ['monday', 'wednesday', 'friday', 'saturday', 'sunday']
    })

    defaultCusts.push({
      id: 'cust-3',
      name: 'Rahul Krishnan',
      phone: '+91 97910 88776',
      email: 'rahul.krish@yahoo.com',
      plan: 'basic',
      quantity: 2,
      apartmentName: 'DLF Gardencity, Semmancheri',
      walletBalance: 120,
      status: 'active',
      daysSelected: ['tuesday', 'thursday', 'saturday']
    })

    defaultCusts.push({
      id: 'cust-4',
      name: 'Priyanka Sen',
      phone: '+91 95000 33442',
      email: 'priyanka.sen@outlook.com',
      plan: 'premium',
      quantity: 4,
      apartmentName: 'Appaswamy Splendour, Sholinganallur',
      walletBalance: 0,
      status: 'paused',
      daysSelected: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    })

    setCustomers(defaultCusts)
    setLoading(false)
  }, [])

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.apartmentName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleWalletAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCust) return
    const adjustVal = Number(adjustmentAmount)
    if (isNaN(adjustVal) || adjustVal <= 0) return

    // Update state
    const updated = customers.map(c => {
      if (c.id === selectedCust.id) {
        const newBal = c.walletBalance + adjustVal
        
        // If it's our active mock user, sync to localStorage wallet storage so it reflects in the layout immediately!
        if (c.id === 'user-mock-123' || c.id === 'user-123') {
          localStorage.setItem('dailynest_mock_wallet_balance', String(newBal))
          // Also append to transactions
          const transactionsRaw = localStorage.getItem('dailynest_mock_wallet_transactions')
          const transactions = JSON.parse(transactionsRaw || '[]')
          const newTx = {
            id: `tx-${Date.now()}`,
            user_id: c.id,
            amount: adjustVal,
            type: 'credit',
            description: 'Wallet top-up (Admin Action)',
            created_at: new Date().toISOString(),
            updated_at: ''
          }
          localStorage.setItem('dailynest_mock_wallet_transactions', JSON.stringify([newTx, ...transactions]))
          window.dispatchEvent(new Event('dailynest_wallet_update'))
        }
        
        return { ...c, walletBalance: newBal }
      }
      return c
    })

    setCustomers(updated)
    setSuccessMsg(`Credited ₹${adjustVal} to ${selectedCust.name}'s wallet!`)
    setSelectedCust(null)
    setTimeout(() => setSuccessMsg(null), 3000)
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
                  Customers Directory
                </h1>
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                  Manage resident details, subscription logs, and wallet points adjustments.
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

            {/* Filter Search */}
            <div className="bg-white rounded-2xl border border-gray-150 shadow-md p-4 mb-8">
              <div className="relative rounded-lg shadow-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search customer by resident name, phone number, or building complex..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 sm:text-sm transition-shadow"
                />
              </div>
            </div>

            {/* Customers table */}
            <div className="bg-white rounded-2xl border border-gray-150 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="text-xs font-semibold text-gray-400 uppercase border-b border-gray-150 bg-gray-50/50">
                    <tr>
                      <th className="py-3 px-4">Resident Info</th>
                      <th className="py-3 px-4">Address Complex</th>
                      <th className="py-3 px-4 text-center">Active Plan Details</th>
                      <th className="py-3 px-4 text-right">Wallet Balance</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-500">
                          No matching customer profiles found.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-gray-55 transition-colors">
                          
                          {/* Name & contact */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-gray-900">{cust.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3 text-gray-400" /> {cust.phone}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-gray-400" /> {cust.email}
                            </div>
                          </td>

                          {/* Apartment complex */}
                          <td className="py-4 px-4">
                            <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                              {cust.apartmentName}
                            </span>
                          </td>

                          {/* Subscription details */}
                          <td className="py-4 px-4 text-center">
                            {cust.plan !== 'inactive' ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-55 text-indigo-700 capitalize border border-indigo-100">
                                  {cust.plan} Plan
                                </span>
                                <div className="text-[10px] text-gray-500 mt-1 uppercase">
                                  {cust.quantity} chapatis / {cust.daysSelected.length} days
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-450 text-xs italic">No Subscription</span>
                            )}
                          </td>

                          {/* Wallet balance */}
                          <td className="py-4 px-4 text-right">
                            <span className={`font-bold text-base ${cust.walletBalance === 0 ? 'text-red-650' : 'text-gray-900'}`}>
                              ₹{cust.walletBalance}
                            </span>
                            {cust.walletBalance === 0 && (
                              <div className="text-[10px] text-red-500 font-semibold uppercase mt-0.5">Low Funds</div>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 text-center">
                            {cust.status === 'active' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                            {cust.status === 'paused' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                Paused
                              </span>
                            )}
                            {cust.status === 'inactive' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Action panel triggers */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setSelectedCust(cust)}
                              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-indigo-200 text-indigo-600 bg-indigo-50 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                            >
                              <CreditCard className="h-3.5 w-3.5" /> Adjust Balance
                            </button>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Wallet top-up adjustments dialog */}
            {selectedCust && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="px-6 py-4 bg-indigo-650 text-white flex items-center justify-between">
                    <h3 className="text-lg font-bold">Credit Wallet Points</h3>
                    <button onClick={() => setSelectedCust(null)} className="text-indigo-200 hover:text-white">
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleWalletAdjustSubmit} className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="text-xs text-gray-500 font-semibold uppercase">Selected Resident</div>
                      <div className="text-base font-bold text-gray-900 mt-1">{selectedCust.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Phone: {selectedCust.phone}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Current Balance: <strong>₹{selectedCust.walletBalance}</strong></div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Crediting Amount (₹)</label>
                      <input
                        type="number"
                        required
                        min="50"
                        placeholder="e.g. 500"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-sm font-bold"
                      />
                      <p className="text-xs text-gray-400 mt-1">This will credit points instantly to this user wallet.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setSelectedCust(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-transparent rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-sm transition-colors shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> Add Credit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}