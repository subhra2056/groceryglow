'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ShoppingCart,
  Heart,
  Search,
  User,
  X,
  ChevronDown,
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  LogOut,
  Leaf,
  Bug,
  Home,
  Grid2X2,
  MoreHorizontal,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'
import NotificationBell from '@/components/navbar/NotificationBell'
import BugReportModal from '@/components/navbar/BugReportModal'
import NotificationToast from '@/components/ui/NotificationToast'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/shop?view=categories', label: 'Categories' },
  { href: '/shop?tag=offer', label: 'Offers' },
]

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/bug-reports', label: 'Bug Reports', icon: Bug },
]

function NavbarContent() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [bugReportOpen, setBugReportOpen] = useState(false)

  const [pendingOrders, setPendingOrders] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, profile, isAdmin, signOut } = useAuth()
  const { itemCount } = useCart()
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  // Pending orders count for admin
  useEffect(() => {
    if (!isAdmin) return
    const supabase = createClient()

    const fetchCount = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('order_status', 'placed')
      setPendingOrders(count ?? 0)
    }
    fetchCount()

    const channel = supabase
      .channel('admin-orders-badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchCount)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isAdmin])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setProfileOpen(false)
    router.push('/')
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (!href.includes('?')) {
      // "Shop" is only active when there's no view/tag param (those belong to Categories/Offers)
      if (href === '/shop') {
        return pathname === '/shop' && !searchParams.get('view') && !searchParams.get('tag')
      }
      return pathname.startsWith(href)
    }
    // For query-param links, match pathname + every param in the href
    const [hrefPath, hrefQuery] = href.split('?')
    if (pathname !== hrefPath) return false
    const hrefParams = new URLSearchParams(hrefQuery)
    for (const [key, value] of hrefParams.entries()) {
      if (searchParams.get(key) !== value) return false
    }
    return true
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'glass shadow-sm border-b border-white/30'
            : 'bg-white/95 backdrop-blur-sm'
        )}
      >
        <div className="container-app">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-forest-green to-leaf-green rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-forest-green tracking-tight">
                Grocery<span className="text-sunset-orange">Glow</span>
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    isActive(link.href)
                      ? 'bg-forest-green/10 text-forest-green'
                      : 'text-gray-600 hover:text-forest-green hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* ── Actions ── */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-forest-green transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {user ? (
                <>
                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* Wishlist — desktop only */}
                  <Link
                    href="/account?tab=wishlist"
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-forest-green transition-colors hidden md:flex"
                    aria-label="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>

                  {/* Cart — desktop only (mobile has bottom nav) */}
                  <Link
                    href="/cart"
                    className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-forest-green transition-colors hidden md:flex"
                    aria-label={`Cart (${itemCount} items)`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sunset-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile dropdown */}
                  <div ref={profileRef} className="relative">
                    <button
                      onClick={() => setProfileOpen((v) => !v)}
                      className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-forest-green text-white text-xs font-semibold flex items-center justify-center">
                        {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <span className="text-sm font-medium text-charcoal max-w-[80px] truncate">
                        {profile?.full_name?.split(' ')[0] ?? 'Account'}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 text-gray-400 transition-transform',
                          profileOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    {/* Dropdown */}
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-2 z-50 animate-slide-in">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                            {isAdmin ? 'Admin Account' : 'My Account'}
                          </p>
                          <p className="text-sm font-semibold text-charcoal truncate mt-0.5">
                            {profile?.full_name}
                          </p>
                        </div>

                        {isAdmin ? (
                          <>
                            <Link
                              href="/account"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors"
                            >
                              <User className="w-4 h-4" />
                              My Profile
                            </Link>
                            <div className="my-1 border-t border-gray-100" />
                            {adminLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors"
                              >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                                {link.label === 'Orders' && pendingOrders > 0 && (
                                  <span className="ml-auto bg-sunset-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {pendingOrders > 9 ? '9+' : pendingOrders}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </>
                        ) : (
                          <>
                            <Link
                              href="/account"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors"
                            >
                              <User className="w-4 h-4" />
                              My Profile
                            </Link>
                            <Link
                              href="/account?tab=orders"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors"
                            >
                              <ClipboardList className="w-4 h-4" />
                              My Orders
                            </Link>
                            <Link
                              href="/account?tab=wishlist"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-forest-green transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              Wishlist
                            </Link>
                          </>
                        )}

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          {!isAdmin && (
                            <button
                              onClick={() => { setProfileOpen(false); setBugReportOpen(true) }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-500 transition-colors"
                            >
                              <Bug className="w-4 h-4" />
                              Report a Bug
                            </button>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/auth/signin" className="btn-ghost text-sm">
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className="btn-secondary text-sm py-2 px-4">
                    Sign Up
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* ── Global Search Overlay ── */}
      {searchOpen && (
        <>
          {/* Mobile: full-screen white panel */}
          <div className="md:hidden fixed inset-0 z-[60] bg-white flex flex-col">
            <form onSubmit={handleSearch} className="flex flex-col flex-1">
              {/* Input row */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 -ml-1 text-gray-500"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search groceries…"
                    className="flex-1 text-sm outline-none bg-transparent text-charcoal placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')}>
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <button type="submit" className="text-forest-green text-sm font-semibold flex-shrink-0">
                    Search
                  </button>
                )}
              </div>
              {/* Popular chips */}
              <div className="px-4 pt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {['Organic', 'Tomatoes', 'Milk', 'Bread', 'Bananas', 'Apples', 'Eggs'].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        router.push(`/shop?search=${encodeURIComponent(q)}`)
                        setSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="text-xs text-forest-green bg-green-50 border border-green-100 px-3 py-1.5 rounded-full font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Desktop: floating card in backdrop */}
          <div
            className="hidden md:flex fixed inset-0 bg-black/50 z-[60] items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <form
              onSubmit={handleSearch}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white rounded-2xl shadow-card-hover"
            >
              <div className="flex items-center gap-3 px-5 py-4 rounded-t-2xl">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for fruits, vegetables, dairy…"
                  className="flex-1 text-base outline-none text-charcoal placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 rounded-b-2xl flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-xs text-gray-400 flex-shrink-0">Popular:</span>
                {['Organic', 'Tomatoes', 'Milk', 'Bread', 'Bananas'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setSearchQuery(q)
                      router.push(`/shop?search=${encodeURIComponent(q)}`)
                      setSearchOpen(false)
                    }}
                    className="text-xs text-forest-green bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-full transition-colors flex-shrink-0 whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── Mobile Side Drawer ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-all duration-300',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-black transition-opacity duration-300',
            mobileOpen ? 'opacity-50' : 'opacity-0'
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-forest-green to-leaf-green rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-forest-green">
                Grocery<span className="text-sunset-orange">Glow</span>
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* User info */}
          {user && (
            <div className="px-5 py-3 bg-forest-green/5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-green text-white font-semibold flex items-center justify-center">
                  {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {profile?.full_name ?? 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center px-5 py-3 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-forest-green bg-forest-green/5 border-r-2 border-forest-green'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-forest-green'
                )}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <div className="my-3 border-t border-gray-100" />
                {!isAdmin ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link
                      href="/account?tab=orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <ClipboardList className="w-4 h-4" /> My Orders
                    </Link>
                    <Link
                      href="/account?tab=wishlist"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <div className="my-1 border-t border-gray-100 mx-5" />
                    {adminLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <link.icon className="w-4 h-4" /> {link.label}
                        {link.label === 'Orders' && pendingOrders > 0 && (
                          <span className="ml-auto bg-sunset-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {pendingOrders > 9 ? '9+' : pendingOrders}
                          </span>
                        )}
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}
          </nav>

          {/* Drawer footer */}
          <div className="border-t border-gray-100 px-4 pt-4 pb-[76px] space-y-2">
            {user ? (
              <>
                {!isAdmin && (
                  <button
                    onClick={() => { setMobileOpen(false); setBugReportOpen(true) }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <Bug className="w-4 h-4 text-red-400" /> Report a Bug
                  </button>
                )}
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false) }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="btn-outline w-full text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary w-full text-center"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to push page content below fixed navbar */}
      <div className="h-16 md:h-18" />

      {/* ── Mobile Bottom Navigation Bar (Blinkit-style) ── */}
      {!pathname.startsWith('/admin') && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.07)]">
          <div className="flex items-stretch h-[60px]">
            {/* Home */}
            <Link
              href="/"
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                isActive('/') ? 'text-forest-green' : 'text-gray-400'
              )}
            >
              <Home className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-semibold tracking-tight">Home</span>
            </Link>

            {/* Shop */}
            <Link
              href="/shop"
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                pathname === '/shop' ? 'text-forest-green' : 'text-gray-400'
              )}
            >
              <Grid2X2 className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-semibold tracking-tight">Shop</span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                pathname === '/cart' ? 'text-forest-green' : 'text-gray-400'
              )}
            >
              <div className="relative">
                <ShoppingCart className="w-[22px] h-[22px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-[18px] h-[18px] bg-sunset-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-tight">Cart</span>
            </Link>

            {/* Account / Sign In */}
            {user ? (
              <Link
                href="/account"
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                  pathname.startsWith('/account') ? 'text-forest-green' : 'text-gray-400'
                )}
              >
                <div className={cn(
                  'w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold',
                  pathname.startsWith('/account') ? 'bg-forest-green text-white' : 'bg-gray-200 text-gray-500'
                )}>
                  {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-[10px] font-semibold tracking-tight">Account</span>
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                  pathname.startsWith('/auth') ? 'text-forest-green' : 'text-gray-400'
                )}
              >
                <User className="w-[22px] h-[22px]" />
                <span className="text-[10px] font-semibold tracking-tight">Sign In</span>
              </Link>
            )}

            {/* More — opens drawer */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-400 transition-colors"
            >
              <MoreHorizontal className="w-[22px] h-[22px]" />
              <span className="text-[10px] font-semibold tracking-tight">More</span>
            </button>
          </div>
        </nav>
      )}

      {/* Bug Report Modal */}
      {bugReportOpen && <BugReportModal onClose={() => setBugReportOpen(false)} />}

      {/* Cart reminder / order update toast */}
      <NotificationToast />
    </>
  )
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 md:h-18" />}>
      <NavbarContent />
    </Suspense>
  )
}
