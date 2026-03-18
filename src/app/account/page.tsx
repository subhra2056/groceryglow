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

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setDeletingAccount(true)
    setDeleteError('')
    const res = await fetch('/api/delete-account', { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setDeleteError(body.error ?? 'Failed to delete account. Please try again.')
      setDeletingAccount(false)
      return
    }
    await signOut()
    router.push('/')
  }

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pb-16">
        <div className="bg-gradient-hero py-10">
          <div className="container-app text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl text-white" style={{fontWeight:400}}>{profile?.full_name ?? 'My Account'}</h1>
                <p className="text-white/50 text-xs tracking-wide mt-0.5 capitalize">{profile?.role ?? 'customer'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-app mt-6 sm:mt-8">
          {/* ── Mobile horizontal tab bar ── */}
          <div className="md:hidden bg-white rounded-2xl p-2 shadow-sm flex gap-1 overflow-x-auto mb-4 scrollbar-hide">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors relative ${
                  activeTab === id
                    ? 'bg-forest-green/10 text-forest-green'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {id === 'notifications' && unreadCount > 0 && (
                  <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 whitespace-nowrap flex-shrink-0 ml-auto transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* ── Desktop Sidebar ── */}
            <div className="hidden md:block md:w-52 flex-shrink-0">
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
                <div className="space-y-4">
                  {/* Profile card */}
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Card header with avatar */}
                    <div className="bg-gradient-to-r from-forest-green to-leaf-green px-5 py-6 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                        {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-base truncate">{profile?.full_name ?? '—'}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-semibold uppercase tracking-wide bg-white/20 text-white px-2 py-0.5 rounded-full">
                          {profile?.role ?? 'customer'}
                        </span>
                      </div>
                      {!editing && (
                        <button
                          onClick={() => { setEditing(true); setProfileError(null) }}
                          className="ml-auto flex-shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                      )}
                    </div>

                    {/* Fields */}
                    <div className="p-4 sm:p-5">
                      {profileError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                          {profileError}
                        </div>
                      )}

                      <div className="space-y-3">
                        {[
                          { label: 'Full Name', key: 'full_name' as const, value: profile?.full_name ?? '', editable: true, icon: User },
                          { label: 'Email Address', key: 'email' as const, value: profile?.email ?? '', editable: false, icon: Bell },
                          { label: 'Phone Number', key: 'phone' as const, value: profile?.phone ?? '', editable: true, icon: ClipboardList },
                        ].map(({ label, key, value, editable, icon: FieldIcon }) => (
                          <div key={key}>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                            {editing && editable && key !== 'email' ? (
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
                              <div className="flex items-center gap-2.5 py-2.5 px-3.5 bg-gray-50 rounded-xl">
                                <FieldIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-charcoal">
                                  {value || <span className="text-gray-300">—</span>}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {editing && (
                        <div className="flex gap-2 mt-4">
                          <button onClick={saveProfile} disabled={savingProfile} className="btn-secondary text-sm py-2 flex-1 justify-center">
                            <Save className="w-3.5 h-3.5" /> {savingProfile ? 'Saving…' : 'Save Changes'}
                          </button>
                          <button onClick={() => setEditing(false)} className="btn-ghost text-sm py-2 px-4">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                        Member since {profile?.created_at ? formatDate(profile.created_at) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete My Account
                    </button>
                  </div>
                </div>
              )}

              {/* Delete account confirmation modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trash2 className="w-7 h-7 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Delete Account?</h2>
                    <p className="text-gray-500 text-sm text-center leading-relaxed mb-4">
                      This will permanently erase your profile, orders, wishlist, reviews, and all other data. <strong className="text-gray-700">There is no way to recover your account.</strong>
                    </p>
                    <p className="text-xs text-gray-400 text-center mb-5">
                      Type <span className="font-semibold text-red-500">DELETE</span> to confirm
                    </p>
                    <input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE here"
                      className="input text-sm mb-4 text-center"
                    />
                    {deleteError && (
                      <p className="text-xs text-red-500 text-center mb-3">{deleteError}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); setDeleteError('') }}
                        className="flex-1 px-4 py-2.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                        className="flex-1 px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {deletingAccount ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><Trash2 className="w-4 h-4" /> Delete Forever</>
                        )}
                      </button>
                    </div>
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
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
                                aria-label="Remove from wishlist"
                              >
                                <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400" />
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
      <Footer hideOnMobile />
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
