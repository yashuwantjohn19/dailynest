// Core database models used by the DailyNest Supabase schema.

export type UserRole = 'customer' | 'admin'

export interface Profile {
  id: string
  phone?: string | null
  name?: string | null
  email?: string | null
  avatar_url?: string | null
  role: UserRole
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
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  apartment_id?: string | null
  label: string
  line1: string
  line2?: string | null
  landmark?: string | null
  city: string
  state: string
  country_name: string
  country_code: string
  postal_code: string
  preferred_delivery_time?: string | null
  assigned_delivery_time?: string | null
  latitude?: number | null
  longitude?: number | null
  location_accuracy_m?: number | null
  location_captured_at?: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  apartment_id?: string | null
  plan: 'basic' | 'standard' | 'family'
  meals_per_week?: number
  quantity?: number
  start_date: string
  end_date?: string | null
  status: 'pending_payment' | 'active' | 'paused' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Delivery {
  id: string
  subscription_id: string
  delivery_date: string
  status: 'scheduled' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  quantity?: number
  meal_type?: string | null
  notes?: string | null
  delivered_at?: string | null
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  user_id: string
  kind: 'top_up' | 'order_deduction' | 'refund' | 'withdrawal' | 'adjustment'
  direction: 'credit' | 'debit'
  amount_paise: number
  balance_after_paise: number
  description: string
  reference_id?: string | null
  created_at: string
}
