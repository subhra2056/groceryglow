'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Ticket, ChevronDown, ChevronUp, CheckCircle2, X } from 'lucide-react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/landing/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, effectivePrice, productImage } from '@/lib/utils'

type AppliedCoupon = {
  coupon_id: string
  type: 'personal' | 'global'
  discount_amount: number
  min_order_amount: number
  code: string
}

export default function CartPage() {
  const { items, subtotal, loading, removeItem, updateQuantity } = useCart()
  const { user } = useAuth()

  const DELIVERY_FEE = subtotal >= 50 ? 0 : 4.99

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    if (typeof window === 'undefined') return null
    try { return JSON.parse(sessionStorage.getItem('cart_coupon') ?? 'null') } catch { return null }
  })
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [showCouponPicker, setShowCouponPicker] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState<{
    id: string; code: string; discount_amount: number; min_order_amount: number; expires_at: string | null
  }[]>([])
  const [fetchingCoupons, setFetchingCoupons] = useState(false)

  const appliedDiscount =
    appliedCoupon && subtotal >= appliedCoupon.min_order_amount
      ? appliedCoupon.discount_amount
      : 0
  const total = Math.max(0, subtotal + DELIVERY_FEE - appliedDiscount)

  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride ?? couponCode).trim().toUpperCase()
    if (!code) return
    setCouponLoading(true)
    setCouponError(null)
    try {
      const res = await fetch('/api/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()
      if (res.ok) {
        setAppliedCoupon(data)
        sessionStorage.setItem('cart_coupon', JSON.stringify(data))
        setCouponError(null)
        setShowCouponPicker(false)
      } else {
        setCouponError(data.error ?? 'Invalid coupon code')
      }
    } catch {
      setCouponError('Something went wrong. Please try again.')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    sessionStorage.removeItem('cart_coupon')
  }

  const handleToggleCouponPicker = async () => {
    if (showCouponPicker) { setShowCouponPicker(false); return }
    setShowCouponPicker(true)
    if (availableCoupons.length > 0 || !user) return
    setFetchingCoupons(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('coupons')
        .select('id, code, discount_amount, min_order_amount, expires_at')
        .eq('user_id', user.id)
        .eq('is_used', false)
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
      setAvailableCoupons(data ?? [])
    } finally {
      setFetchingCoupons(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <Footer hideOnMobile />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pb-16">
        {/* Header */}
        <div className="bg-gradient-hero py-10">
          <div className="container-app text-white">
            <h1 className="font-serif text-2xl sm:text-3xl text-white flex items-center gap-3" style={{fontWeight:400}}>
              <ShoppingCart className="w-7 h-7" />
              My Cart
              {items.length > 0 && (
                <span className="text-sm font-sans font-normal opacity-60 tracking-wide">
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="container-app mt-8">
          {items.length === 0 ? (
            /* Empty cart */
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm max-w-md mx-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-9 h-9 text-gray-300" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl text-charcoal mb-2" style={{fontWeight:400}}>Your cart is empty</h2>
              <p className="text-gray-400 text-sm mb-8 max-w-xs">
                Looks like you haven&apos;t added anything yet. Start shopping!
              </p>
              <Link href="/shop" className="btn-primary">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ── Cart Items ── */}
              <div className="lg:col-span-2 space-y-3">
                {items.map(({ product, quantity }) => {
                  const price = effectivePrice(product)
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                    >
                      {/* Image */}
                      <Link href={`/product/${product.id}`} className="flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={productImage(product.images)}
                          alt={product.name}
                          className="w-16 h-16 object-contain"
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-sm font-semibold text-charcoal hover:text-forest-green transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatPrice(price)} / {product.unit ?? 'unit'}
                        </p>

                        {/* Mobile price total */}
                        <p className="text-forest-green font-bold text-sm mt-1 md:hidden">
                          {formatPrice(price * quantity)}
                        </p>
                      </div>

                      {/* Qty control */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>

                      {/* Desktop line total */}
                      <div className="hidden md:block text-right flex-shrink-0 w-20">
                        <p className="text-forest-green font-bold text-sm">
                          {formatPrice(price * quantity)}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-2 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}

                {/* Continue shopping */}
                <Link href="/shop" className="inline-flex items-center gap-2 text-forest-green text-sm font-medium hover:gap-3 transition-all pt-2">
                  ← Continue Shopping
                </Link>
              </div>

              {/* ── Order Summary ── */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                  <h2 className="text-lg font-bold text-charcoal mb-5">Order Summary</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery fee</span>
                      <span className={DELIVERY_FEE === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                        {DELIVERY_FEE === 0 ? 'FREE' : formatPrice(DELIVERY_FEE)}
                      </span>
                    </div>
                    {DELIVERY_FEE === 0 && (
                      <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                        🎉 You qualify for free delivery!
                      </p>
                    )}
                    {DELIVERY_FEE > 0 && (
                      <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                        Add {formatPrice(50 - subtotal)} more for free delivery
                      </p>
                    )}
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Coupon ({appliedCoupon!.code})</span>
                        <span>-{formatPrice(appliedDiscount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-forest-green text-lg">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* ── Coupon Section ── */}
                  {user && (
                    <div className="mt-4">
                      {appliedCoupon ? (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-green-700 font-mono tracking-wide">{appliedCoupon.code}</p>
                            <p className="text-xs text-green-600">₹{appliedCoupon.discount_amount} off applied!</p>
                          </div>
                          <button
                            onClick={handleRemoveCoupon}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              value={couponCode}
                              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null) }}
                              onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                              placeholder="Coupon code"
                              className="input flex-1 py-2 text-xs uppercase font-mono tracking-wide"
                            />
                            <button
                              onClick={() => handleApplyCoupon()}
                              disabled={couponLoading || !couponCode.trim()}
                              className="px-4 py-2 bg-forest-green text-white text-xs font-semibold rounded-xl hover:bg-forest-green/90 transition-colors disabled:opacity-40 flex-shrink-0"
                            >
                              {couponLoading ? '...' : 'Apply'}
                            </button>
                          </div>
                          {couponError && <p className="text-[11px] text-red-500 mt-1.5">{couponError}</p>}

                          {/* View my coupons toggle */}
                          <button
                            onClick={handleToggleCouponPicker}
                            className="mt-2 text-xs text-forest-green font-medium flex items-center gap-1 hover:underline"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            {showCouponPicker ? 'Hide coupons' : 'View my coupons'}
                            {showCouponPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {showCouponPicker && (
                            <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                              {fetchingCoupons ? (
                                <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
                              ) : availableCoupons.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">
                                  No active coupons available
                                </p>
                              ) : (
                                availableCoupons.map((c) => {
                                  const eligible = subtotal >= c.min_order_amount
                                  const shortfall = Math.ceil(c.min_order_amount - subtotal)
                                  return (
                                    <div
                                      key={c.id}
                                      className={`border-2 rounded-xl p-3 flex items-center gap-3 ${
                                        eligible
                                          ? 'border-forest-green/25 bg-green-50/60'
                                          : 'border-gray-100 bg-gray-50/80'
                                      }`}
                                    >
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${eligible ? 'bg-forest-green/10' : 'bg-gray-100'}`}>
                                        <Ticket className={`w-3.5 h-3.5 ${eligible ? 'text-forest-green' : 'text-gray-400'}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold font-mono tracking-wide ${eligible ? 'text-charcoal' : 'text-gray-400'}`}>{c.code}</p>
                                        <p className={`text-[11px] mt-0.5 ${eligible ? 'text-gray-500' : 'text-gray-400'}`}>
                                          ₹{c.discount_amount} off · min ₹{c.min_order_amount}
                                        </p>
                                        {!eligible && (
                                          <p className="text-[10px] text-orange-500 font-medium mt-0.5">Add ₹{shortfall} more</p>
                                        )}
                                      </div>
                                      {eligible ? (
                                        <button
                                          onClick={() => handleApplyCoupon(c.code)}
                                          disabled={couponLoading}
                                          className="text-[11px] bg-forest-green text-white px-2.5 py-1.5 rounded-lg font-semibold hover:bg-forest-green/90 transition-colors flex-shrink-0"
                                        >
                                          Apply
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-lg flex-shrink-0">Locked</span>
                                      )}
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <Link
                    href="/checkout"
                    className="btn-primary w-full mt-5 justify-center"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>

                  {/* Trust badges */}
                  <div className="flex justify-center gap-4 mt-4 text-[10px] text-gray-400">
                    <span>🔒 Secure checkout</span>
                    <span>🌿 100% organic</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer hideOnMobile />
    </>
  )
}
