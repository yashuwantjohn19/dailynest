export interface Subscription {
  id: string
  userId: string
  plan: string
  status: 'active' | 'inactive'
  createdAt: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  mealsPerWeek: number
}