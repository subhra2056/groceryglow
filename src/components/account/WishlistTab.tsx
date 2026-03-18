'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { SkeletonProductGrid } from '@/components/ui/Skeleton'
import { formatPrice, productImage } from '@/lib/utils'
import type { WishlistItem } from '@/types'

interface WishlistTabProps {
  wishlist: WishlistItem[]
  dataLoading: boolean
  removeFromWishlist: (id: string) => Promise<void>
}

export default function WishlistTab({ wishlist, dataLoading, removeFromWishlist }: WishlistTabProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-charcoal mb-4">My Wishlist</h2>
      {dataLoading ? (
        <SkeletonProductGrid />
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
                  <Image
                    src={productImage(item.product.images)}
                    alt={item.product.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 object-contain"
                  />
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
  )
}
