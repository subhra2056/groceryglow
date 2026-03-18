'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  User,
  ClipboardList,
  Heart,
  Bell,
  LogOut,
  MapPin,
  Ticket,
} from 'lucide-react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/landing/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { createClient } from '@/lib/supabase/client'
import type { Order, WishlistItem } from '@/types'
import { useRouter } from 'next/navigation'

import ProfileTab from '@/components/account/ProfileTab'
import AddressesTab from '@/components/account/AddressesTab'
import OrdersTab from '@/components/account/OrdersTab'
import WishlistTab from '@/components/account/WishlistTab'
import NotificationsTab from '@/components/account/NotificationsTab'
import CouponsTab from '@/components/account/CouponsTab'

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
  const { notifications, markAsRead, markAllAsRead, unreadCount, clearAll } = useNotifications()
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
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user!.id)
      }

      if (editingAddress) {
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

    const phone = editForm.phone.trim()
    if (phone && !/^\d{7,15}$/.test(phone)) {
      setProfileError('Phone must be 7–15 digits with no symbols or spaces.')
      return
    }

    setSavingProfile(true)
    setProfileError(null)
    const supabase = createClient()

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
        {/* ── Profile Hero ── */}
        <div className="bg-gradient-hero relative overflow-hidden pb-10 pt-8 sm:pt-10">
          {/* Decorative rings */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full border border-white/8 pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-52 h-52 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-6 right-1/4 w-6 h-6 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-6 left-1/3 w-3 h-3 bg-white/15 rounded-full pointer-events-none" />

          <div className="container-app relative z-10">
            <div className="flex items-end gap-4 sm:gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-white/30 to-white/10 border-[3px] border-white/50 flex items-center justify-center shadow-xl">
                  <span className="font-serif text-3xl sm:text-4xl text-white font-normal" style={{ lineHeight: 1 }}>
                    {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                </div>
                {/* Online dot */}
                <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full shadow" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-white/55 text-xs tracking-[0.12em] uppercase font-medium mb-1">My Account</p>
                <h1 className="font-serif text-white leading-tight truncate" style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', fontWeight: 400 }}>
                  {profile?.full_name ?? 'Hello there'}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/20">
                    {profile?.role ?? 'customer'}
                  </span>
                  {profile?.email && (
                    <span className="text-white/45 text-[11px] truncate max-w-[150px] sm:max-w-xs">{profile.email}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex gap-2.5 mt-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 w-40 sm:w-48 flex-shrink-0">
                <p className="text-white/45 text-[9px] font-bold uppercase tracking-[0.14em] mb-1">Member Since</p>
                <p className="text-white font-semibold text-sm">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10 w-40 sm:w-48 flex-shrink-0">
                <p className="text-white/45 text-[9px] font-bold uppercase tracking-[0.14em] mb-1">Phone</p>
                <p className="text-white font-semibold text-sm truncate">{profile?.phone ?? 'Not set'}</p>
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

            {/* ── Tab Content ── */}
            <div className="flex-1 min-w-0">
              {activeTab === 'profile' && (
                <ProfileTab
                  profile={profile}
                  editing={editing}
                  setEditing={setEditing}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  savingProfile={savingProfile}
                  profileError={profileError}
                  setProfileError={setProfileError}
                  saveProfile={saveProfile}
                  showChangePassword={showChangePassword}
                  setShowChangePassword={setShowChangePassword}
                  pwForm={pwForm}
                  setPwForm={setPwForm}
                  pwShow={pwShow}
                  setPwShow={setPwShow}
                  pwLoading={pwLoading}
                  pwError={pwError}
                  setPwError={setPwError}
                  pwSuccess={pwSuccess}
                  handleChangePassword={handleChangePassword}
                  showDeleteConfirm={showDeleteConfirm}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                  deleteConfirmText={deleteConfirmText}
                  setDeleteConfirmText={setDeleteConfirmText}
                  deletingAccount={deletingAccount}
                  deleteError={deleteError}
                  setDeleteError={setDeleteError}
                  handleDeleteAccount={handleDeleteAccount}
                />
              )}

              {activeTab === 'addresses' && (
                <AddressesTab
                  addresses={addresses}
                  dataLoading={dataLoading}
                  showAddressForm={showAddressForm}
                  setShowAddressForm={setShowAddressForm}
                  editingAddress={editingAddress}
                  setEditingAddress={setEditingAddress}
                  addressForm={addressForm}
                  setAddressForm={setAddressForm}
                  savingAddress={savingAddress}
                  addressError={addressError}
                  setAddressError={setAddressError}
                  handleSaveAddress={handleSaveAddress}
                  handleSetDefault={handleSetDefault}
                  handleDeleteAddress={handleDeleteAddress}
                  handleEditAddress={handleEditAddress}
                  emptyAddressForm={emptyAddressForm}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  dataLoading={dataLoading}
                />
              )}

              {activeTab === 'wishlist' && (
                <WishlistTab
                  wishlist={wishlist}
                  dataLoading={dataLoading}
                  removeFromWishlist={removeFromWishlist}
                />
              )}

              {activeTab === 'coupons' && (
                <CouponsTab
                  coupons={coupons}
                  dataLoading={dataLoading}
                  copiedCode={copiedCode}
                  copyCode={copyCode}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsTab
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markAsRead}
                  markAllAsRead={markAllAsRead}
                  clearAll={clearAll}
                />
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
