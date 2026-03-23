// Database types for DailyNest Supabase schema

export interface User {
  id: string
  phone: string
  name?: string
  email?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Apartment {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip_code: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  apartment_id: string
  plan: 'basic' | 'premium' | 'family'
  meals_per_week: number
  start_date: string
  end_date?: string
  status: 'active' | 'paused' | 'cancelled'
  created_at: string
  updated_at: string
  // Relations
  user?: User
  apartment?: Apartment
}

export interface Delivery {
  id: string
  subscription_id: string
  delivery_date: string
  status: 'scheduled' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  meal_type: string
  notes?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  // Relations
  subscription?: Subscription
}

export interface WalletTransaction {
  id: string
  user_id: string
  amount: number
  type: 'credit' | 'debit'
  description: string
  reference_id?: string // Could reference subscription or delivery
  created_at: string
  updated_at: string
  // Relations
  user?: User
}