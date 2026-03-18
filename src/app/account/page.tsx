'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
  Ticket,
  Copy,
  Check,
  MapPin,
  Plus,
  Home,
  Briefcase,
  MoreHorizontal,
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

type Tab = 'profile' | 'addresses' | 'orders' | 'wishlist' | 'notifications' | 'coupons'

interface CouponRow {
  id: string
  code: string
  discount_amount: number
  min_order_amount: number
  is_used: boolean
  is_active: boolean
  expires_at: string | null
  created_at: string
}

interface UserAddress {
  id: string
  label: string
  full_name: string
  phone: string
  address_line_1: string
  address_line_2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

const LABEL_STYLES: Record<string, string> = {
  Home: 'bg-blue-100 text-blue-700',
  Work: 'bg-purple-100 text-purple-700',
  Other: 'bg-gray-100 text-gray-600',
}

const LABEL_ICONS: Record<string, typeof Home> = {
  Home: Home,
  Work: Briefcase,
  Other: MoreHorizontal,
}

const emptyAddressForm = {
  label: 'Home' as 'Home' | 'Work' | 'Other',
  full_name: '',
  phone: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'India',
  is_default: false,
}

function AccountContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) ?? 'profile')
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [coupons, setCoupons] = useState<CouponRow[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Profile edit state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ full_name: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Addresses state
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)
  const [addressForm, setAddressForm] = useState(emptyAddressForm)
  const [savingAddress, setSavingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    if (activeTab === 'orders') loadOrders()
    if (activeTab === 'wishlist') loadWishlist()
    if (activeTab === 'coupons') loadCoupons()
    if (activeTab === 'addresses') loadAddresses()
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

  const loadCoupons = async () => {
    setDataLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    setCoupons(data ?? [])
    setDataLoading(false)
  }

  const loadAddresses = async () => {
    setDataLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user!.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    setAddresses(data ?? [])
    setDataLoading(false)
  }

  const handleSaveAddress = async () => {
    if (!addressForm.full_name.trim() || !addressForm.address_line_1.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.postal_code.trim()) {
      setAddressError('Please fill in all required fields.')
      return
    }
    setSavingAddress(true)
    setAddressError(null)
    const supabase = createClient()

    try {
      if (addressForm.is_default) {
        // Clear default on all other addresses first
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user!.id)
      }

      if (editingAddress) {
        // Update existing
        await supabase
          .from('user_addresses')
          .update({
            label: addressForm.label,
            full_name: addressForm.full_name.trim(),
            phone: addressForm.phone.trim(),
            address_line_1: addressForm.address_line_1.trim(),
            address_line_2: addressForm.address_line_2.trim() || null,
            city: addressForm.city.trim(),
            state: addressForm.state.trim(),
            postal_code: addressForm.postal_code.trim(),
            country: addressForm.country.trim(),
            is_default: addressForm.is_default,
          })
          .eq('id', editingAddress.id)
      } else {
        // Insert new — if first address, auto-set as default
        const isFirst = addresses.length === 0
        await supabase
          .from('user_addresses')
          .insert({
            user_id: user!.id,
            label: addressForm.label,
            full_name: addressForm.full_name.trim(),
            phone: addressForm.phone.trim(),
            address_line_1: addressForm.address_line_1.trim(),
            address_line_2: addressForm.address_line_2.trim() || null,
            city: addressForm.city.trim(),
            state: addressForm.state.trim(),
            postal_code: addressForm.postal_code.trim(),
            country: addressForm.country.trim(),
            is_default: isFirst || addressForm.is_default,
          })
      }

      await loadAddresses()
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm(emptyAddressForm)
    } catch {
      setAddressError('Failed to save address. Please try again.')
    } finally {
      setSavingAddress(false)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    const supabase = createClient()
    await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user!.id)
    await supabase.from('user_addresses').update({ is_default: true }).eq('id', addressId)
    await loadAddresses()
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Delete this address?')) return
    const supabase = createClient()
    await supabase.from('user_addresses').delete().eq('id', addressId)
    setAddresses((prev) => prev.filter((a) => a.id !== addressId))
  }

  const handleEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr)
    setAddressForm({
      label: addr.label as 'Home' | 'Work' | 'Other',
      full_name: addr.full_name,
      phone: addr.phone ?? '',
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2 ?? '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
      is_default: addr.is_default,
    })
    setShowAddressForm(true)
    setAddressError(null)
  }

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
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

  const handleChangePassword = async () => {
    setPwError(null)
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    setPwLoading(true)
    const supabase = createClient()
    // Verify current password by re-signing in
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: profile!.email,
      password: pwForm.current,
    })
    if (signInErr) { setPwError('Current password is incorrect.'); setPwLoading(false); return }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    if (error) { setPwError(error.message); setPwLoading(false); return }
    setPwSuccess(true)
    setPwForm({ current: '', next: '', confirm: '' })
    setPwLoading(false)
    setTimeout(() => { setPwSuccess(false); setShowChangePassword(false) }, 2000)
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
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
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
          <div className="md:hidden bg-white rounded-2xl p-2 pr-3 shadow-sm flex gap-1 overflow-x-auto mb-4 scrollbar-hide">
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
                <div className="relative flex-shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                  {id === 'notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {label}
              </button>
            ))}
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

                  {/* Change Password */}
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => { setShowChangePassword((v) => !v); setPwError(null); setPwSuccess(false) }}
                      className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-charcoal hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5"><KeyRound className="w-4 h-4 text-forest-green" /> Change Password</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showChangePassword ? 'rotate-180' : ''}`} />
                    </button>
                    {showChangePassword && (
                      <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                        {pwSuccess && (
                          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                            Password updated successfully!
                          </div>
                        )}
                        {pwError && (
                          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                            {pwError}
                          </div>
                        )}
                        {(['current', 'next', 'confirm'] as const).map((field) => (
                          <div key={field}>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                              {field === 'current' ? 'Current Password' : field === 'next' ? 'New Password' : 'Confirm New Password'}
                            </p>
                            <div className="relative">
                              <input
                                type={pwShow[field] ? 'text' : 'password'}
                                value={pwForm[field]}
                                onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                                className="input text-sm pr-10"
                                placeholder={field === 'current' ? 'Enter current password' : field === 'next' ? 'Min. 8 characters' : 'Re-enter new password'}
                              />
                              <button
                                type="button"
                                onClick={() => setPwShow((s) => ({ ...s, [field]: !s[field] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {pwShow[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={handleChangePassword}
                          disabled={pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm}
                          className="btn-secondary text-sm py-2 w-full justify-center mt-1"
                        >
                          {pwLoading ? 'Updating…' : 'Update Password'}
                        </button>
                      </div>
                    )}
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

              {/* ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-charcoal">My Addresses</h2>
                    {!showAddressForm && (
                      <button
                        onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm(emptyAddressForm); setAddressError(null) }}
                        className="flex items-center gap-1.5 text-sm font-medium text-white bg-forest-green hover:bg-forest-green/90 px-3 py-2 rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Address
                      </button>
                    )}
                  </div>

                  {dataLoading ? (
                    <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
                  ) : (
                    <>
                      {/* Address list */}
                      {addresses.length === 0 && !showAddressForm ? (
                        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MapPin className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-gray-600 font-semibold text-sm">No saved addresses</p>
                          <p className="text-gray-400 text-xs mt-1">Add a delivery address to speed up checkout.</p>
                          <button
                            onClick={() => { setShowAddressForm(true); setAddressError(null) }}
                            className="btn-secondary mt-4 inline-flex text-sm"
                          >
                            <Plus className="w-4 h-4" /> Add Address
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((addr) => {
                            const LabelIcon = LABEL_ICONS[addr.label] ?? MoreHorizontal
                            return (
                              <div key={addr.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${LABEL_STYLES[addr.label] ?? LABEL_STYLES.Other}`}>
                                        <LabelIcon className="w-3 h-3" />
                                        {addr.label}
                                      </span>
                                      {addr.is_default && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-0.5">
                                          <Check className="w-2.5 h-2.5" /> Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm font-semibold text-charcoal">{addr.full_name}</p>
                                    {addr.phone && <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>}
                                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                                      {addr.address_line_1}
                                      {addr.address_line_2 && `, ${addr.address_line_2}`}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {addr.city}, {addr.state} — {addr.postal_code}
                                    </p>
                                    <p className="text-xs text-gray-400">{addr.country}</p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                                    <button
                                      onClick={() => handleEditAddress(addr)}
                                      className="p-2 rounded-lg text-gray-400 hover:text-forest-green hover:bg-forest-green/8 transition-colors"
                                      title="Edit address"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAddress(addr.id)}
                                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                      title="Delete address"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {!addr.is_default && (
                                  <button
                                    onClick={() => handleSetDefault(addr.id)}
                                    className="mt-3 text-xs text-forest-green font-medium hover:underline flex items-center gap-1"
                                  >
                                    <MapPin className="w-3 h-3" /> Set as default
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Inline address form */}
                      {showAddressForm && (
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-forest-green/20">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-charcoal">
                              {editingAddress ? 'Edit Address' : 'New Address'}
                            </h3>
                            <button
                              onClick={() => { setShowAddressForm(false); setEditingAddress(null); setAddressForm(emptyAddressForm); setAddressError(null) }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {addressError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
                              {addressError}
                            </div>
                          )}

                          {/* Label chips */}
                          <div className="mb-4">
                            <label className="text-xs font-medium text-gray-600 mb-2 block">Address Label</label>
                            <div className="flex gap-2 flex-wrap">
                              {(['Home', 'Work', 'Other'] as const).map((lbl) => {
                                const LblIcon = LABEL_ICONS[lbl]
                                return (
                                  <button
                                    key={lbl}
                                    type="button"
                                    onClick={() => setAddressForm((f) => ({ ...f, label: lbl }))}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                      addressForm.label === lbl
                                        ? lbl === 'Home'
                                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                                          : lbl === 'Work'
                                          ? 'bg-purple-100 text-purple-700 border-purple-300'
                                          : 'bg-gray-200 text-gray-700 border-gray-400'
                                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <LblIcon className="w-3 h-3" />
                                    {lbl}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full Name *</label>
                              <input
                                value={addressForm.full_name}
                                onChange={(e) => setAddressForm((f) => ({ ...f, full_name: e.target.value }))}
                                className="input text-sm"
                                placeholder="Full name"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone</label>
                              <input
                                value={addressForm.phone}
                                onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                                className="input text-sm"
                                placeholder="Phone number"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Address Line 1 *</label>
                              <input
                                value={addressForm.address_line_1}
                                onChange={(e) => setAddressForm((f) => ({ ...f, address_line_1: e.target.value }))}
                                className="input text-sm"
                                placeholder="Street address"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Address Line 2 (optional)</label>
                              <input
                                value={addressForm.address_line_2}
                                onChange={(e) => setAddressForm((f) => ({ ...f, address_line_2: e.target.value }))}
                                className="input text-sm"
                                placeholder="Flat, building, landmark"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">City *</label>
                              <input
                                value={addressForm.city}
                                onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                                className="input text-sm"
                                placeholder="City"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">State *</label>
                              <input
                                value={addressForm.state}
                                onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
                                className="input text-sm"
                                placeholder="State"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Postal Code *</label>
                              <input
                                value={addressForm.postal_code}
                                onChange={(e) => setAddressForm((f) => ({ ...f, postal_code: e.target.value }))}
                                className="input text-sm"
                                placeholder="PIN code"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Country *</label>
                              <input
                                value={addressForm.country}
                                onChange={(e) => setAddressForm((f) => ({ ...f, country: e.target.value }))}
                                className="input text-sm"
                                placeholder="Country"
                              />
                            </div>
                          </div>

                          {/* Set as default checkbox */}
                          <label className="flex items-center gap-2.5 mt-4 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={addressForm.is_default}
                              onChange={(e) => setAddressForm((f) => ({ ...f, is_default: e.target.checked }))}
                              className="w-4 h-4 rounded accent-forest-green"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-charcoal transition-colors">
                              Set as default address
                            </span>
                          </label>

                          <div className="flex gap-2 mt-5">
                            <button
                              onClick={handleSaveAddress}
                              disabled={savingAddress}
                              className="btn-secondary text-sm py-2 flex-1 justify-center"
                            >
                              {savingAddress ? (
                                <><LoadingSpinner size="sm" /> Saving…</>
                              ) : (
                                <><Save className="w-3.5 h-3.5" /> {editingAddress ? 'Update Address' : 'Save Address'}</>
                              )}
                            </button>
                            <button
                              onClick={() => { setShowAddressForm(false); setEditingAddress(null); setAddressForm(emptyAddressForm); setAddressError(null) }}
                              className="btn-ghost text-sm py-2 px-4"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
                              <Image src={productImage(item.product.images)} alt={item.product.name} width={96} height={96} className="h-24 w-24 object-contain" />
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

              {/* COUPONS */}
              {activeTab === 'coupons' && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <h2 className="text-lg font-bold text-charcoal">My Coupons</h2>
                    {coupons.filter(c => !c.is_used && !(c.expires_at && new Date(c.expires_at) < new Date())).length > 0 && (
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                        {coupons.filter(c => !c.is_used && !(c.expires_at && new Date(c.expires_at) < new Date())).length} active
                      </span>
                    )}
                  </div>
                  {dataLoading ? (
                    <div className="flex justify-center py-10"><LoadingSpinner /></div>
                  ) : coupons.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Ticket className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-600 font-semibold text-sm">No coupons yet</p>
                      <p className="text-gray-400 text-xs mt-1 leading-relaxed">Loyalty coupons arrive every 5 days.<br/>New users get NEWBIE100 on signup.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {coupons.map((c) => {
                        const expired = c.expires_at ? new Date(c.expires_at) < new Date() : false
                        const status = c.is_used ? 'used' : expired ? 'expired' : 'active'
                        const isActive = status === 'active'
                        return (
                          <div
                            key={c.id}
                            className={`relative flex rounded-2xl overflow-hidden shadow-sm transition-opacity ${!isActive ? 'opacity-50' : ''}`}
                          >
                            {/* Left panel — discount amount */}
                            <div className={`flex flex-col items-center justify-center px-4 sm:px-6 py-5 flex-shrink-0 min-w-[80px] sm:min-w-[96px] ${
                              isActive
                                ? 'bg-gradient-to-b from-forest-green to-leaf-green'
                                : 'bg-gray-300'
                            }`}>
                              <span className="text-white font-black text-2xl sm:text-3xl leading-none">₹{c.discount_amount}</span>
                              <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">OFF</span>
                            </div>

                            {/* Perforated divider */}
                            <div className="relative flex-shrink-0 flex items-center" style={{ width: '20px' }}>
                              {/* Semi-circle top */}
                              <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full ${isActive ? 'bg-cream' : 'bg-cream'}`} />
                              {/* Dashed line */}
                              <div className={`w-px h-full border-l-2 border-dashed mx-auto ${isActive ? 'border-forest-green/25' : 'border-gray-200'}`} />
                              {/* Semi-circle bottom */}
                              <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-cream`} />
                            </div>

                            {/* Right panel — code & details */}
                            <div className={`flex-1 flex flex-col justify-between px-4 py-4 min-w-0 ${isActive ? 'bg-white' : 'bg-gray-50'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  {/* Code + status */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-mono font-bold text-sm sm:text-base tracking-widest ${isActive ? 'text-charcoal' : 'text-gray-400'}`}>
                                      {c.code}
                                    </span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      status === 'active' ? 'bg-green-100 text-green-700' :
                                      status === 'used'   ? 'bg-gray-100 text-gray-500' :
                                                           'bg-red-50 text-red-400'
                                    }`}>
                                      {status === 'active' ? '✓ Active' : status === 'used' ? 'Used' : 'Expired'}
                                    </span>
                                  </div>
                                  {/* Description */}
                                  <p className="text-xs text-gray-500 mt-1.5">
                                    Get <span className="font-semibold text-charcoal">₹{c.discount_amount} off</span> on orders above ₹{c.min_order_amount}
                                  </p>
                                  {/* Expiry */}
                                  {c.expires_at && (
                                    <p className={`text-[11px] mt-1 flex items-center gap-1 ${status === 'expired' ? 'text-red-400' : 'text-gray-400'}`}>
                                      🗓 {status === 'expired' ? 'Expired on' : 'Valid till'}{' '}
                                      {new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                  )}
                                </div>

                                {/* Copy button */}
                                {isActive && (
                                  <button
                                    onClick={() => copyCode(c.code)}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all ${
                                      copiedCode === c.code
                                        ? 'bg-green-100 text-green-600 scale-95'
                                        : 'bg-forest-green/8 border border-forest-green/20 text-forest-green hover:bg-forest-green/15'
                                    }`}
                                  >
                                    {copiedCode === c.code
                                      ? <><Check className="w-4 h-4" /><span>Copied!</span></>
                                      : <><Copy className="w-4 h-4" /><span>Copy</span></>
                                    }
                                  </button>
                                )}
                              </div>

                              {/* Bottom: min order note */}
                              {isActive && (
                                <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex items-center gap-1.5">
                                  <Ticket className="w-3 h-3 text-gray-300 flex-shrink-0" />
                                  <p className="text-[10px] text-gray-400">Min. order ₹{c.min_order_amount} · Apply at checkout</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
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
