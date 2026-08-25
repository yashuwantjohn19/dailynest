'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useUser } from '../../hooks/useUser'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  if (loading || !user) {
    return <div className="app-surface flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#e56b35]" /></div>
  }

  if (user.role !== 'admin') {
    return (
      <div className="app-surface flex items-center justify-center px-4">
        <div className="surface-card max-w-md w-full p-8 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Admin access required</h1>
          <p className="mt-2 text-sm text-gray-600">This account does not have permission to open DailyNest administration tools.</p>
          <button onClick={() => router.replace('/dashboard')} className="button button-dark mt-6">Return to dashboard</button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
