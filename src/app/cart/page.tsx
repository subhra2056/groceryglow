'use client'
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag } from 'lucide-react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/landing/Footer'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, effectivePrice, productImage } from '@/lib/utils'

export default function CartPage() {
  const { items, subtotal, loading, removeItem, updateQuantity } = useCart()

  const DELIVERY_FEE = subtotal >= 50 ? 0 : 4.99
  const total = subtotal + DELIVERY_FEE

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
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-charcoal mb-2">Your cart is empty</h2>
              <p className="text-gray-400 text-sm mb-6">
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
                  </div>

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <div className="flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span className="text-forest-green text-lg">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Coupon placeholder */}
                  <div className="mt-4 flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Coupon code"
                        className="input pl-9 py-2 text-xs"
                      />
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-200 transition-colors">
                      Apply
                    </button>
                  </div>

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
