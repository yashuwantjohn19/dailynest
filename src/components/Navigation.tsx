'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
  TrendingUp,
  UserRound
} from 'lucide-react'
import { useUser } from '../hooks/useUser'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Subscription', href: '/subscription', icon: ChefHat },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Account', href: '/account', icon: UserRound },
]

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: Settings },
  { name: 'Apartments List', href: '/admin/apartments', icon: MapPin },
  { name: 'Customers Ledger', href: '/admin/customers', icon: Users },
  { name: 'Production Planner', href: '/admin/production', icon: TrendingUp },
]


export default function Navigation() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const desktopShellRef = useRef<HTMLDivElement>(null)
  const mobileHeaderRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user, logout } = useUser()

  const isAdmin = user?.role === 'admin'
  const visibleNavigation = user ? navigation : [{ name: 'Home', href: '/', icon: Home }]

  useEffect(() => {
    if (!sidebarOpen) return
    const background = document.querySelector('main')
    const opener = openerRef.current
    const backgroundRegions = [background, desktopShellRef.current, mobileHeaderRef.current].filter(Boolean) as Element[]
    backgroundRegions.forEach((region) => {
      region.setAttribute('inert', '')
      region.setAttribute('aria-hidden', 'true')
    })
    closeRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'))
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      backgroundRegions.forEach((region) => {
        region.removeAttribute('inert')
        region.removeAttribute('aria-hidden')
      })
      document.removeEventListener('keydown', handleKeyDown)
      opener?.focus()
    }
  }, [sidebarOpen])

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-[#321c31]/70" aria-hidden="true" onClick={() => setSidebarOpen(false)} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mobile-nav-title" className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-[#fffdf8]">
            <div className="flex h-20 flex-shrink-0 items-center justify-between px-5 bg-[#321c31] text-white">
              <h1 id="mobile-nav-title" className="text-xl font-black tracking-[-.04em]">Daily<span className="text-[#f18a55]">Nest</span></h1>
              <button
                ref={closeRef}
                type="button"
                aria-label="Close navigation"
                className="text-white hover:text-gray-200"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-grow flex flex-col justify-between overflow-y-auto">
              <nav className="flex-1 space-y-1 px-2 py-4">
                {visibleNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center rounded-xl px-3 py-3 text-sm font-semibold ${pathname === item.href ? 'bg-[#f1e4cf] text-[#321c31]' : 'text-[#6f625f] hover:bg-[#f8eee0]'}`}
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
                    className={`group flex items-center rounded-xl px-3 py-3 text-sm font-semibold ${pathname === item.href ? 'bg-[#f1e4cf] text-[#321c31]' : 'text-[#6f625f] hover:bg-[#f8eee0]'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                    {item.name}
                  </Link>
                ))}
                {!user && <Link href="/login" onClick={() => setSidebarOpen(false)} className="mt-3 flex items-center justify-center rounded-xl bg-[#e56b35] px-3 py-3 text-sm font-bold text-white">Log in</Link>}
              </nav>

              {user && (
                <div className="flex-shrink-0 flex border-t border-gray-150 p-4 bg-gray-50">
                  <div className="flex items-center w-full justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="h-9 w-9 rounded-full bg-[#f1e4cf] text-[#321c31] flex items-center justify-center font-bold text-sm flex-shrink-0 border border-[#d7c5ad]">
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
      <div ref={desktopShellRef} className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-[#fffdf8] border-r border-[#dfd0bd]">
          <div className="flex h-20 flex-shrink-0 items-center px-6 bg-[#321c31] text-white">
            <h1 className="text-xl font-black tracking-[-.04em]">Daily<span className="text-[#f18a55]">Nest</span></h1>
          </div>
          
          <div className="flex-grow flex flex-col justify-between overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-xl px-3 py-3 text-sm font-semibold ${pathname === item.href ? 'bg-[#f1e4cf] text-[#321c31]' : 'text-[#6f625f] hover:bg-[#f8eee0]'}`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              ))}
              {isAdmin && adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-xl px-3 py-3 text-sm font-semibold ${pathname === item.href ? 'bg-[#f1e4cf] text-[#321c31]' : 'text-[#6f625f] hover:bg-[#f8eee0]'}`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              ))}
              {!user && <Link href="/login" className="mt-3 flex items-center justify-center rounded-xl bg-[#e56b35] px-3 py-3 text-sm font-bold text-white">Log in</Link>}
            </nav>

            {user && (
              <div className="flex-shrink-0 flex border-t border-gray-150 p-4 bg-gray-50">
                <div className="flex items-center w-full justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="h-9 w-9 rounded-full bg-[#f1e4cf] text-[#321c31] flex items-center justify-center font-bold text-sm flex-shrink-0 border border-[#d7c5ad]">
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
      <div ref={mobileHeaderRef} className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between bg-[#321c31] border-b border-[#57304f] px-4 text-white lg:hidden">
        <button
          ref={openerRef}
          type="button"
          aria-label="Open navigation"
          className="text-white/80 hover:text-white"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-black tracking-[-.04em]">Daily<span className="text-[#f18a55]">Nest</span></h1>
        <div className="w-6" /> {/* Spacer for centering */}
      </div>
    </>
  )
}
