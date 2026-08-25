import { Apartment, Subscription, Delivery } from '../types/database'

export const DEFAULT_APARTMENTS: Apartment[] = [
  { id: 'apt-1', name: 'Garden Court', address: 'Central Road', city: 'Local delivery area', state: 'Tamil Nadu', zip_code: '600130', created_at: '', updated_at: '' },
  { id: 'apt-2', name: 'Birchwood Homes', address: 'Lake Road', city: 'Local delivery area', state: 'Tamil Nadu', zip_code: '600130', created_at: '', updated_at: '' },
  { id: 'apt-3', name: 'Greenview Apartments', address: 'Garden Street', city: 'Local delivery area', state: 'Tamil Nadu', zip_code: '600119', created_at: '', updated_at: '' },
  { id: 'apt-4', name: 'Neighbourhood Heights', address: 'Main Road', city: 'Local delivery area', state: 'Tamil Nadu', zip_code: '600119', created_at: '', updated_at: '' },
]

export const getMockApartments = (): Apartment[] => {
  return DEFAULT_APARTMENTS
}

export interface MockSubscription extends Subscription {
  quantity: number
  days_selected: string[]
  paused: boolean
}

const isBundleQuantity = (quantity: number) => {
  if (!Number.isInteger(quantity) || quantity <= 0) return false
  for (let family = 0; family * 32 <= quantity; family += 1) {
    for (let standard = 0; family * 32 + standard * 20 <= quantity; standard += 1) {
      if ((quantity - family * 32 - standard * 20) % 10 === 0) return true
    }
  }
  return false
}

export const getMockSubscription = (): MockSubscription | null => {
  if (typeof window === 'undefined') return null
  const sub = localStorage.getItem('dailynest_mock_subscription')
  if (!sub) return null
  const parsed = JSON.parse(sub) as MockSubscription
  if (!isBundleQuantity(parsed.quantity)) {
    localStorage.removeItem('dailynest_mock_subscription')
    return null
  }
  return parsed
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
