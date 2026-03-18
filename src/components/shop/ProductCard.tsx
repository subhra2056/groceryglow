'use client'

import { useState } from 'react'
import Link from 'next/link'
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
    <div className="card group">
      {/* ── Image ── */}
      <div className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productImage(product.images)}
          alt={product.name}
          className={cn(
            'h-36 w-36 object-contain transition-transform duration-500',
            !outOfStock && 'group-hover:scale-110'
          )}
        />

        {/* Badges */}
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

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          disabled={togglingWishlist}
          className={cn(
            'absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm transition-all hover:scale-110',
            'opacity-0 group-hover:opacity-100',
            localWishlisted && 'opacity-100 text-red-400'
          )}
          aria-label={localWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('w-3.5 h-3.5', localWishlisted ? 'fill-current text-red-400' : 'text-gray-400')} />
        </button>
      </div>

      {/* ── Info ── */}
      <div className="p-4">
        {product.category && (
          <p className="text-xs text-gray-400 mb-1 font-medium">{product.category.name}</p>
        )}

        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-charcoal hover:text-forest-green transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>

        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs text-gray-500">
              {product.rating_average.toFixed(1)} ({product.review_count})
            </span>
          </div>
        )}

        {/* Price + Quantity controls */}
        <div className="flex items-end justify-between mt-3 gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-forest-green font-bold text-base">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-gray-400 text-xs line-through">{formatPrice(product.price)}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">/{product.unit ?? 'unit'}</p>
          </div>

          {/* Blinkit-style quantity control */}
          {outOfStock ? (
            <span className="text-[10px] text-gray-400 font-medium">Out of stock</span>
          ) : quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-3 h-8 bg-forest-green text-white text-xs font-bold rounded-lg hover:bg-green-700 active:scale-95 transition-all flex-shrink-0"
            >
              <Plus className="w-3 h-3" /> ADD
            </button>
          ) : (
            <div className="flex items-center bg-forest-green rounded-lg overflow-hidden flex-shrink-0 h-8">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-green-700 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-white text-xs font-bold">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 flex items-center justify-center text-white hover:bg-green-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
