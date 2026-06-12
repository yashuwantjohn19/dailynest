import { Apartment, Subscription, Delivery, WalletTransaction } from '../types/database'

export const DEFAULT_APARTMENTS: Apartment[] = [
  { id: 'apt-1', name: 'Olympia Opaline, Navalur', address: 'OMR Road, Navalur', city: 'Chennai', state: 'Tamil Nadu', zip_code: '600130', created_at: '', updated_at: '' },
  { id: 'apt-2', name: 'Hiranandani Birchwood, Egattur', address: 'OMR Road, Egattur', city: 'Chennai', state: 'Tamil Nadu', zip_code: '600130', created_at: '', updated_at: '' },
  { id: 'apt-3', name: 'DLF Gardencity, Semmancheri', address: 'Semmancheri', city: 'Chennai', state: 'Tamil Nadu', zip_code: '600119', created_at: '', updated_at: '' },
  { id: 'apt-4', name: 'Appaswamy Splendour, Sholinganallur', address: 'Sholinganallur', city: 'Chennai', state: 'Tamil Nadu', zip_code: '600119', created_at: '', updated_at: '' },
]

export const getMockApartments = (): Apartment[] => {
  return DEFAULT_APARTMENTS
}

export const getMockWallet = () => {
  if (typeof window === 'undefined') return { balance: 0, transactions: [] }
  const balance = localStorage.getItem('dailynest_mock_wallet_balance')
  const transactionsRaw = localStorage.getItem('dailynest_mock_wallet_transactions')
  
  if (!balance) {
    localStorage.setItem('dailynest_mock_wallet_balance', '1250')
    const initialTx: WalletTransaction[] = [
      { id: 'tx-1', user_id: 'user-123', amount: 1500, type: 'credit', description: 'Wallet top-up (UPI)', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updated_at: '' },
      { id: 'tx-2', user_id: 'user-123', amount: 120, type: 'debit', description: 'Chapati Delivery', reference_id: 'del-1', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updated_at: '' },
      { id: 'tx-3', user_id: 'user-123', amount: 130, type: 'debit', description: 'Chapati Delivery', reference_id: 'del-2', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updated_at: '' },
    ]
    localStorage.setItem('dailynest_mock_wallet_transactions', JSON.stringify(initialTx))
    return { balance: 1250, transactions: initialTx }
  }
  
  return {
    balance: Number(balance),
    transactions: JSON.parse(transactionsRaw || '[]') as WalletTransaction[]
  }
}

export const updateMockWallet = (amount: number, type: 'credit' | 'debit', description: string) => {
  const { balance, transactions } = getMockWallet()
  const newBalance = type === 'credit' ? balance + amount : balance - amount
  
  const newTx: WalletTransaction = {
    id: `tx-${Date.now()}`,
    user_id: 'user-123',
    amount,
    type,
    description,
    created_at: new Date().toISOString(),
    updated_at: ''
  }
  
  localStorage.setItem('dailynest_mock_wallet_balance', String(newBalance))
  localStorage.setItem('dailynest_mock_wallet_transactions', JSON.stringify([newTx, ...transactions]))
  
  window.dispatchEvent(new Event('dailynest_wallet_update'))
  return { balance: newBalance, transactions: [newTx, ...transactions] }
}

export interface MockSubscription extends Subscription {
  quantity: number
  days_selected: string[]
  paused: boolean
}

export const getMockSubscription = (): MockSubscription | null => {
  if (typeof window === 'undefined') return null
  const sub = localStorage.getItem('dailynest_mock_subscription')
  if (!sub) {
    // Return a default subscription
    const defaultSub: MockSubscription = {
      id: 'sub-123',
      user_id: 'user-123',
      apartment_id: 'apt-1',
      plan: 'premium',
      meals_per_week: 5,
      quantity: 4,
      start_date: new Date().toISOString().split('T')[0],
      status: 'active',
      days_selected: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      paused: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    localStorage.setItem('dailynest_mock_subscription', JSON.stringify(defaultSub))
    return defaultSub
  }
  return JSON.parse(sub)
}

export const saveMockSubscription = (sub: MockSubscription | null) => {
  if (typeof window === 'undefined') return
  if (sub === null) {
    localStorage.removeItem('dailynest_mock_subscription')
  } else {
    localStorage.setItem('dailynest_mock_subscription', JSON.stringify(sub))
  }
  window.dispatchEvent(new Event('dailynest_subscription_update'))
}

// Generate deliveries based on selected subscription days
export const getMockDeliveries = (): Delivery[] => {
  if (typeof window === 'undefined') return []
  const sub = getMockSubscription()
  if (!sub || sub.status === 'cancelled') return []
  
  const deliveriesRaw = localStorage.getItem('dailynest_mock_deliveries')
  if (deliveriesRaw) {
    return JSON.parse(deliveriesRaw)
  }

  // Generate 7 days of deliveries starting from today
  const generated: Delivery[] = []
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  
  for (let i = -2; i < 8; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dayStr = d.toISOString().split('T')[0]
    const weekday = weekdays[d.getDay()]
    
    if (sub.days_selected.includes(weekday)) {
      const isPast = i < 0
      generated.push({
        id: `del-${dayStr}`,
        subscription_id: sub.id,
        delivery_date: dayStr,
        status: sub.paused ? 'cancelled' : (isPast ? 'delivered' : 'scheduled'),
        meal_type: 'Dinner',
        notes: 'Deliver to door handle',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }
  
  localStorage.setItem('dailynest_mock_deliveries', JSON.stringify(generated))
  return generated
}

export const saveMockDeliveries = (deliveries: Delivery[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('dailynest_mock_deliveries', JSON.stringify(deliveries))
  window.dispatchEvent(new Event('dailynest_deliveries_update'))
}
