'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  ClipboardList,
  Heart,
  Bell,
  LogOut,
  Edit3,
  Save,
  X,
  Package,
  Trash2,
} from 'lucide-react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/landing/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { createClient } from '@/lib/supabase/client'
import {
  formatPrice,
  formatDate,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  productImage,
} from '@/lib/utils'
import type { Order, WishlistItem } from '@/types'
import { useRouter } from 'next/navigation'

type Tab = 'profile' | 'orders' | 'wishlist' | 'notifications'

function AccountContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) ?? 'profile')
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Profile edit state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    if (activeTab === 'orders') loadOrders()
    if (activeTab === 'wishlist') loadWishlist()
  }, [activeTab, user])

  useEffect(() => {
    if (profile) setEditForm({ full_name: profile.full_name ?? '', phone: profile.phone ?? '' })
  }, [profile])

  const loadOrders = async () => {
    setDataLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setDataLoading(false)
  }

  const loadWishlist = async () => {
    setDataLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('wishlists')
      .select('*, product:products(*, category:categories(*))')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setWishlist(data ?? [])
    setDataLoading(false)
  }

  const removeFromWishlist = async (wishlistId: string) => {
    const supabase = createClient()
    await supabase.from('wishlists').delete().eq('id', wishlistId)
    setWishlist((prev) => prev.filter((w) => w.id !== wishlistId))
  }

  const saveProfile = async () => {
    if (!user) return

    // Phone validation
    const phone = editForm.phone.trim()
    if (phone && !/^\d{7,15}$/.test(phone)) {
      setProfileError('Phone must be 7–15 digits with no symbols or spaces.')
      return
    }

    setSavingProfile(true)
    setProfileError(null)
    const supabase = createClient()

    // Check phone uniqueness (exclude current user)
    if (phone && phone !== (profile?.phone ?? '')) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .neq('id', user.id)
        .maybeSingle()
      if (existing) {
        setProfileError('This phone number is already linked to another account.')
        setSavingProfile(false)
        return
      }
    }

    const { error } = await supabase.from('profiles').update({ ...editForm, phone: phone || null }).eq('id', user.id)
    if (error) {
      if (error.code === '23505') {
        setProfileError('This phone number is already linked to another account.')
      } else if (error.code === '23514') {
        setProfileError('Phone must be 7–15 digits with no symbols or spaces.')
      } else {
        setProfileError('Failed to save changes. Please try again.')
      }
      setSavingProfile(false)
      return
    }
    await refreshProfile()
    setEditing(false)
    setSavingProfile(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: ClipboardList },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pb-16">
        <div className="bg-gradient-hero py-10">
          <div className="container-app text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-black">
                {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-black">{profile?.full_name ?? 'My Account'}</h1>
                <p className="text-white/70 text-sm">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-app mt-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* ── Sidebar ── */}
            <div className="md:w-52 flex-shrink-0">
              <div className="bg-white rounded-2xl p-3 shadow-sm">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
                      activeTab === id
                        ? 'bg-forest-green/10 text-forest-green'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-forest-green'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {id === 'notifications' && unreadCount > 0 && (
                      <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 min-w-0">
              {/* PROFILE */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-charcoal">Profile Information</h2>
                    {!editing ? (
                      <button onClick={() => { setEditing(true); setProfileError(null) }} className="btn-ghost text-sm flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={saveProfile} disabled={savingProfile} className="btn-secondary text-sm py-1.5">
                          <Save className="w-3.5 h-3.5" /> {savingProfile ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditing(false)} className="btn-ghost text-sm py-1.5">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {profileError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-2">
                      {profileError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: 'Full Name', key: 'full_name' as const, value: profile?.full_name ?? '', editable: true },
                      { label: 'Email', key: 'email' as const, value: profile?.email ?? '', editable: false },
                      { label: 'Phone', key: 'phone' as const, value: profile?.phone ?? '', editable: true },
                      { label: 'Account Type', key: 'role' as const, value: profile?.role ?? 'customer', editable: false },
                    ].map(({ label, key, value, editable }) => (
                      <div key={key}>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">
                          {label}
                        </label>
                        {editing && editable && key !== 'email' && key !== 'role' ? (
                          <input
                            value={editForm[key as keyof typeof editForm] ?? ''}
                            onChange={(e) => {
                              const val = key === 'phone'
                                ? e.target.value.replace(/\D/g, '').slice(0, 15)
                                : e.target.value
                              setEditForm((f) => ({ ...f, [key]: val }))
                            }}
                            placeholder={key === 'phone' ? 'Digits only, 7–15 numbers' : undefined}
                            inputMode={key === 'phone' ? 'numeric' : undefined}
                            className="input text-sm"
                          />
                        ) : (
                          <p className="text-sm font-medium text-charcoal py-3 px-4 bg-gray-50 rounded-xl">
                            {value || <span className="text-gray-300">—</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Member since {profile?.created_at ? formatDate(profile.created_at) : '—'}
                    </p>
                  </div>
                </div>
              )}

              {/* ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-charcoal">My Orders</h2>
                  {dataLoading ? (
                    <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                      <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No orders yet. Start shopping!</p>
                      <Link href="/shop" className="btn-primary mt-4 inline-flex">Browse Products</Link>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div>
                            <p className="text-xs text-gray-400">Order</p>
                            <p className="font-bold text-charcoal text-sm">{order.order_number}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className={`badge text-xs px-2.5 py-1 ${ORDER_STATUS_COLORS[order.order_status]}`}>
                              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                            </span>
                            <span className={`badge text-xs px-2.5 py-1 ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        {order.items && order.items.length > 0 && (
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {order.items.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                                <span className="text-xs text-gray-600 truncate max-w-[100px]">{item.name}</span>
                                <span className="text-[10px] text-gray-400">×{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-xs text-gray-400">+{order.items.length - 3} more</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{formatDate(order.created_at)}</span>
                          <span className="font-bold text-forest-green">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* WISHLIST */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-lg font-bold text-charcoal mb-4">My Wishlist</h2>
                  {dataLoading ? (
                    <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
                  ) : wishlist.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                      <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Your wishlist is empty.</p>
                      <Link href="/shop" className="btn-primary mt-4 inline-flex">Discover Products</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {wishlist.map((item) => (
                        item.product && (
                          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all">
                            <div className="relative bg-gray-50 h-36 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={productImage(item.product.images)} alt={item.product.name} className="h-24 w-24 object-contain" />
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-red-400 hover:scale-110 transition-transform"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="p-3">
                              <Link href={`/product/${item.product.id}`}>
                                <p className="text-xs font-semibold text-charcoal hover:text-forest-green line-clamp-2 leading-tight">
                                  {item.product.name}
                                </p>
                              </Link>
                              <p className="text-forest-green font-bold text-sm mt-1">
                                {formatPrice(item.product.discount_price ?? item.product.price)}
                              </p>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-charcoal">Notifications</h2>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-forest-green font-medium hover:underline">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                      <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No notifications yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-card transition-all ${!n.is_read ? 'border-l-4 border-forest-green' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`text-sm font-medium text-charcoal ${!n.is_read ? 'font-semibold' : ''}`}>
                                {n.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {!n.is_read && <span className="w-2 h-2 bg-forest-green rounded-full" />}
                              <p className="text-[10px] text-gray-400">{formatDate(n.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountContent />
    </Suspense>
  )
}
