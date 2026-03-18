'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, CreditCard, Wallet, CheckCircle2, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/landing/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, effectivePrice, generateOrderNumber } from '@/lib/utils'
import type { CheckoutFormData } from '@/types'

type Step = 'address' | 'payment' | 'success'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>('address')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string>('')

  const DELIVERY_FEE = subtotal >= 50 ? 0 : 4.99
  const total = subtotal + DELIVERY_FEE

  const [form, setForm] = useState<CheckoutFormData>({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    payment_method: 'cash_on_delivery',
  })

  const update = (field: keyof CheckoutFormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handlePlaceOrder = async () => {
    if (!user || items.length === 0) return
    setPlacingOrder(true)

    const supabase = createClient()
    const number = generateOrderNumber()

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: number,
        subtotal,
        delivery_fee: DELIVERY_FEE,
        discount: 0,
        total,
        payment_method: form.payment_method,
        payment_status: form.payment_method === 'cash_on_delivery' ? 'pending' : 'paid',
        order_status: 'placed',
        delivery_full_name: form.full_name,
        delivery_phone: form.phone,
        delivery_address_line_1: form.address_line_1,
        delivery_address_line_2: form.address_line_2,
        delivery_city: form.city,
        delivery_state: form.state,
        delivery_postal_code: form.postal_code,
        delivery_country: form.country,
      })
      .select()
      .single()

    if (error || !order) {
      setPlacingOrder(false)
      alert('Failed to place order. Please try again.')
      return
    }

    // Insert order items
    await supabase.from('order_items').insert(
      items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        name: product.name,
        price: effectivePrice(product),
        quantity,
        image: product.images?.[0] ?? null,
      }))
    )

    // Clear the cart
    await clearCart()

    setOrderId(order.id)
    setOrderNumber(number)
    setPlacingOrder(false)
    setStep('success')
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl mb-3">🛒</p>
            <p className="text-gray-500 mb-4">Your cart is empty. Add some items first!</p>
            <Link href="/shop" className="btn-primary">Browse Products</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (step === 'success') {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-cream flex items-center justify-center py-16">
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm max-w-md w-full mx-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-charcoal mb-2">Order Placed! 🎉</h1>
            <p className="text-gray-400 text-sm mb-1">Your order number is</p>
            <p className="text-forest-green font-bold text-lg mb-4">{orderNumber}</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              We&apos;ve received your order and will have it packed and shipped shortly.
              You&apos;ll receive notifications as your order progresses.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 text-left mb-6 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery</span>
                <span>{DELIVERY_FEE === 0 ? 'FREE' : formatPrice(DELIVERY_FEE)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Paid</span>
                <span className="text-forest-green">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment</span>
                <span>{form.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Card (Paid)'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/account?tab=orders`} className="btn-secondary w-full justify-center">
                Track My Order
              </Link>
              <Link href="/shop" className="btn-outline w-full text-center">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
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
            <h1 className="text-3xl font-black">Checkout</h1>
            {/* Steps */}
            <div className="flex items-center gap-4 mt-3">
              {(['address', 'payment'] as const).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-white text-forest-green' : 'bg-white/30 text-white'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-sm capitalize ${step === s ? 'font-semibold text-white' : 'text-white/60'}`}>
                    {s === 'address' ? 'Delivery Address' : 'Payment'}
                  </span>
                  {i === 0 && <span className="text-white/40 ml-2">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container-app mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Form ── */}
            <div className="lg:col-span-2">
              {step === 'address' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-charcoal mb-5 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-forest-green" />
                    Delivery Address
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Full Name *</label>
                      <input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="input" placeholder="John Doe" required />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone *</label>
                      <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input" placeholder="+1 234 567 8900" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Address Line 1 *</label>
                      <input value={form.address_line_1} onChange={(e) => update('address_line_1', e.target.value)} className="input" placeholder="123 Main Street" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Address Line 2 (optional)</label>
                      <input value={form.address_line_2} onChange={(e) => update('address_line_2', e.target.value)} className="input" placeholder="Apt, Suite, Unit…" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">City *</label>
                      <input value={form.city} onChange={(e) => update('city', e.target.value)} className="input" placeholder="San Francisco" required />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">State *</label>
                      <input value={form.state} onChange={(e) => update('state', e.target.value)} className="input" placeholder="California" required />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Postal Code *</label>
                      <input value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} className="input" placeholder="94102" required />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Country *</label>
                      <input value={form.country} onChange={(e) => update('country', e.target.value)} className="input" placeholder="United States" required />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Link href="/cart" className="btn-ghost flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back to Cart
                    </Link>
                    <button
                      onClick={() => {
                        if (!form.full_name || !form.address_line_1 || !form.city || !form.state || !form.postal_code) {
                          alert('Please fill in all required fields.')
                          return
                        }
                        setStep('payment')
                      }}
                      className="btn-secondary"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-charcoal mb-5 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-forest-green" />
                    Payment Method
                  </h2>

                  <div className="space-y-3 mb-6">
                    {[
                      {
                        value: 'cash_on_delivery',
                        label: 'Cash on Delivery',
                        description: 'Pay in cash when your order arrives',
                        icon: Wallet,
                      },
                      {
                        value: 'card',
                        label: 'Credit / Debit Card',
                        description: 'Simulated payment — no real charge',
                        icon: CreditCard,
                      },
                    ].map(({ value, label, description, icon: Icon }) => (
                      <label
                        key={value}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          form.payment_method === value
                            ? 'border-forest-green bg-forest-green/5'
                            : 'border-gray-200 hover:border-forest-green/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={value}
                          checked={form.payment_method === value}
                          onChange={() => update('payment_method', value)}
                          className="hidden"
                        />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.payment_method === value ? 'bg-forest-green text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-charcoal">{label}</p>
                          <p className="text-xs text-gray-400">{description}</p>
                        </div>
                        {form.payment_method === value && (
                          <CheckCircle2 className="w-5 h-5 text-forest-green ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Fake card fields */}
                  {form.payment_method === 'card' && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Card Details (Demo — No Real Charge)</p>
                      <input className="input text-sm" placeholder="Card Number: 4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" readOnly />
                      <div className="grid grid-cols-2 gap-3">
                        <input className="input text-sm" placeholder="MM / YY" defaultValue="12 / 27" readOnly />
                        <input className="input text-sm" placeholder="CVC" defaultValue="123" readOnly />
                      </div>
                      <p className="text-[10px] text-gray-400">This is a demo payment. No real money is charged.</p>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button onClick={() => setStep('address')} className="btn-ghost flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder}
                      className="btn-primary"
                    >
                      {placingOrder ? (
                        <><LoadingSpinner size="sm" /> Placing Order…</>
                      ) : (
                        <>Place Order — {formatPrice(total)}</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Order Summary ── */}
            <div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-charcoal mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4 max-h-52 overflow-y-auto scrollbar-hide">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={product.images?.[0] ?? '/placeholder-product.svg'} alt={product.name} className="w-10 h-10 object-contain flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-charcoal truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-400">×{quantity}</p>
                      </div>
                      <p className="text-xs font-semibold text-forest-green flex-shrink-0">
                        {formatPrice(effectivePrice(product) * quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span>{DELIVERY_FEE === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(DELIVERY_FEE)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-forest-green">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
