import Link from 'next/link'
import { useState } from 'react'
import {
  Home,
  Calendar,
  Wallet,
  Settings,
  Menu,
  X,
  ChefHat,
  LogOut,
  MapPin,
  Users,
  TrendingUp
} from 'lucide-react'
import { useUser } from '../hooks/useUser'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Subscription', href: '/subscription', icon: ChefHat },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
]

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: Settings },
  { name: 'Apartments List', href: '/admin/apartments', icon: MapPin },
  { name: 'Customers Ledger', href: '/admin/customers', icon: Users },
  { name: 'Production Planner', href: '/admin/production', icon: TrendingUp },
]


export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useUser()

  // Enabled for development previews
  const isAdmin = true

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
            <div className="flex h-16 flex-shrink-0 items-center justify-between px-4 bg-indigo-600 text-white">
              <h1 className="text-xl font-bold">DailyNest</h1>
              <button
                type="button"
                className="text-white hover:text-gray-200"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-grow flex flex-col justify-between overflow-y-auto">
              <nav className="flex-1 space-y-1 px-2 py-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                    {item.name}
                  </Link>
                ))}
                {isAdmin && adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {user && (
                <div className="flex-shrink-0 flex border-t border-gray-150 p-4 bg-gray-50">
                  <div className="flex items-center w-full justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="h-9 w-9 rounded-full bg-indigo-150 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-indigo-200">
                        {user.name ? user.name.slice(0, 2).toUpperCase() : 'DN'}
                      </div>
                      <div className="ml-3 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{user.name || 'Resident'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setSidebarOpen(false)
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Log Out"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
 
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-250">
          <div className="flex h-16 flex-shrink-0 items-center px-4 bg-indigo-600 text-white">
            <h1 className="text-xl font-bold">DailyNest</h1>
          </div>
          
          <div className="flex-grow flex flex-col justify-between overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              ))}
              {isAdmin && adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {user && (
              <div className="flex-shrink-0 flex border-t border-gray-150 p-4 bg-gray-50">
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="h-9 w-9 rounded-full bg-indigo-150 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-indigo-200">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : 'DN'}
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 truncate">{user.name || 'Resident'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
 
      {/* Mobile header */}
      <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between bg-white border-b border-gray-200 px-4 lg:hidden">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-600"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">DailyNest</h1>
        <div className="w-6" /> {/* Spacer for centering */}
      </div>
    </>
  )
}