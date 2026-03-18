'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, Plus, Minus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import {
  formatPrice,
  effectivePrice,
  discountPercent,
  productImage,
  cn,
} from '@/lib/utils'
import type { Product } from '@/types'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
  wishlisted?: boolean
  onWishlistToggle?: (productId: string) => void
}

export default function ProductCard({ product, wishlisted = false, onWishlistToggle }: ProductCardProps) {
  const [togglingWishlist, setTogglingWishlist] = useState(false)
  const [localWishlisted, setLocalWishlisted] = useState(wishlisted)
  const { addItem, updateQuantity, items } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const price = effectivePrice(product)
  const hasDiscount = product.discount_price !== null
  const outOfStock = product.stock === 0

  // Current quantity in cart
  const cartItem = items.find((i) => i.product.id === product.id)
  const quantity = cartItem?.quantity ?? 0

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push('/auth/signin'); return }
    if (outOfStock) return
    await addItem(product, 1)
  }

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantity >= product.stock) return
    await updateQuantity(product.id, quantity + 1)
  }

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await updateQuantity(product.id, quantity - 1)
  }

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { router.push('/auth/signin'); return }
    setTogglingWishlist(true)
    const supabase = createClient()
    if (localWishlisted) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id)
      setLocalWishlisted(false)
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id })
      setLocalWishlisted(true)
    }
    setTogglingWishlist(false)
    onWishlistToggle?.(product.id)
  }

  return (
    <div className="card group flex flex-col h-full">
      {/* ── Image ── */}
      <div className="relative bg-gray-50 h-28 sm:h-32 flex items-center justify-center overflow-hidden flex-shrink-0 rounded-t-2xl">
        <Image
          src={productImage(product.images)}
          alt={product.name}
          width={96}
          height={96}
          className={cn(
            'h-20 w-20 sm:h-24 sm:w-24 object-contain transition-transform duration-500',
            !outOfStock && 'group-hover:scale-110'
          )}
          sizes="(max-width: 640px) 80px, 96px"
        />

        {/* Badges — top left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="badge-orange text-[10px]">
              -{discountPercent(product.price, product.discount_price!)}%
            </span>
          )}
          {product.is_organic && <span className="badge-green text-[10px]">Organic</span>}
          {outOfStock && (
            <span className="badge bg-gray-200 text-gray-500 text-[10px]">Out of Stock</span>
          )}
        </div>

        {/* Wishlist — top right */}
        <button
          onClick={handleWishlistToggle}
          disabled={togglingWishlist}
          className={cn(
            'absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm transition-all hover:scale-110',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100',
            localWishlisted && '!opacity-100'
          )}
          aria-label={localWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('w-3.5 h-3.5', localWishlisted ? 'fill-red-400 text-red-400' : 'text-gray-400')} />
        </button>
      </div>

      {/* ── Info ── */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1">
        {/* Category */}
        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-medium truncate">
          {product.category?.name ?? ''}
        </p>

        {/* Name — 2-line clamp, fixed min-height keeps rows aligned */}
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xs sm:text-sm font-semibold text-charcoal hover:text-forest-green transition-colors line-clamp-2 leading-snug mt-0.5 min-h-[2rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating — fixed height so cards align even with no reviews */}
        <div className="flex items-center gap-0.5 mt-1 h-3.5">
          {product.review_count > 0 && (
            <>
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-current flex-shrink-0" />
              <span className="text-[10px] text-gray-400 font-medium leading-none">
                {product.rating_average.toFixed(1)}
              </span>
            </>
          )}
        </div>

        {/* Price + ADD — pinned to bottom */}
        <div className="flex items-center justify-between mt-2 gap-1">
          <div className="min-w-0">
            <span className="text-forest-green font-extrabold text-sm leading-none">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-gray-300 text-[10px] line-through ml-1">{formatPrice(product.price)}</span>
            )}
          </div>

          {!outOfStock && (
            quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="flex items-center gap-0.5 px-2.5 h-7 bg-forest-green text-white text-[11px] font-bold rounded-lg hover:bg-green-700 active:scale-95 transition-all flex-shrink-0"
              >
                <Plus className="w-3 h-3" /> ADD
              </button>
            ) : (
              <div className="flex items-center bg-forest-green rounded-lg overflow-hidden flex-shrink-0 h-7">
                <button onClick={handleDecrease} className="w-7 h-7 flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-white text-xs font-bold">{quantity}</span>
                <button onClick={handleIncrease} disabled={quantity >= product.stock} className="w-7 h-7 flex items-center justify-center text-white hover:bg-green-700 transition-colors disabled:opacity-40">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
