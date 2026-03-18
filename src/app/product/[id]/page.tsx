'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronLeft,
  Leaf,
} from 'lucide-react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/landing/Footer'
import ProductCard from '@/components/shop/ProductCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  formatPrice,
  effectivePrice,
  discountPercent,
  productImage,
  starArray,
  formatDate,
  cn,
} from '@/lib/utils'
import type { Product, Review } from '@/types'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState('')

  const { addItem } = useCart()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (!productId) return
    const supabase = createClient()

    const load = async () => {
      // Product
      const { data: prod } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', productId)
        .single()

      if (!prod) { router.push('/shop'); return }
      setProduct(prod)

      // Check wishlist
      if (user) {
        const { data: wl } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .single()
        setWishlisted(!!wl)
      }

      // Reviews
      const { data: revs } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(10)
      setReviews(revs ?? [])

      // Check if user already reviewed
      if (user) {
        const existing = (revs ?? []).find((r) => r.user_id === user.id) ?? null
        setExistingReview(existing)
        if (existing) {
          setReviewRating(existing.rating)
          setReviewText(existing.comment ?? '')
        }
      }

      // Related
      if (prod.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('category_id', prod.category_id)
          .neq('id', productId)
          .limit(4)
        setRelated(rel ?? [])
      }

      setLoading(false)
    }

    load()
  }, [productId, user, router])

  const handleAddToCart = async () => {
    if (!user) { router.push('/auth/signin'); return }
    if (!product) return
    setAddingToCart(true)
    await addItem(product, quantity)
    setAddingToCart(false)
  }

  const handleWishlistToggle = async () => {
    if (!user) { router.push('/auth/signin'); return }
    if (!product) return
    const supabase = createClient()
    if (wishlisted) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', product.id)
      setWishlisted(false)
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: product.id })
      setWishlisted(true)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !product || !reviewText.trim()) return
    setSubmittingReview(true)
    const supabase = createClient()

    // Always fetch the freshest full_name so we never store a stale email prefix
    let displayName = profile?.full_name
    if (!displayName) {
      const { data: freshProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      displayName = freshProfile?.full_name
    }
    const userName = displayName ?? user.email?.split('@')[0] ?? 'Anonymous'

    if (existingReview) {
      await supabase.from('reviews').update({
        rating: reviewRating,
        comment: reviewText.trim(),
        user_name: userName,
      }).eq('id', existingReview.id)
    } else {
      await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.id,
        user_name: userName,
        rating: reviewRating,
        comment: reviewText.trim(),
      })
    }

    // Refresh reviews
    const { data: revs } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(10)
    setReviews(revs ?? [])
    const updated = (revs ?? []).find((r) => r.user_id === user.id) ?? null
    setExistingReview(updated)
    setIsEditingReview(false)
    setReviewSuccess(existingReview ? 'Review updated successfully!' : 'Review submitted!')
    setTimeout(() => setReviewSuccess(''), 3000)
    setSubmittingReview(false)
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

  if (!product) return null

  const price = effectivePrice(product)
  const hasDiscount = product.discount_price !== null
  const images = product.images?.filter(Boolean) ?? []

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pb-16">
        <div className="container-app py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-forest-green transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-forest-green transition-colors">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/shop?category=${product.category.slug}`} className="hover:text-forest-green transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-charcoal font-medium truncate max-w-[180px]">{product.name}</span>
          </nav>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl p-6 md:p-10 shadow-sm">
            {/* ── Image Gallery ── */}
            <div className="flex gap-4">
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        'w-16 h-16 rounded-xl border-2 overflow-hidden transition-all flex-shrink-0',
                        activeImage === i ? 'border-forest-green' : 'border-gray-100 hover:border-gray-300'
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 bg-gray-50 rounded-2xl flex items-center justify-center h-80 md:h-96 overflow-hidden relative">
                {images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[activeImage] ?? productImage(null)}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                  />
                ) : (
                  <span className="text-9xl">🛒</span>
                )}

                {hasDiscount && (
                  <div className="absolute top-4 left-4 badge-orange text-sm font-bold py-1 px-3">
                    -{discountPercent(product.price, product.discount_price!)}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* ── Product Info ── */}
            <div className="flex flex-col gap-4">
              {product.category && (
                <Link href={`/shop?category=${product.category.slug}`} className="text-forest-green text-sm font-medium hover:underline">
                  {product.category.name}
                </Link>
              )}

              <h1 className="font-serif text-2xl md:text-3xl text-charcoal leading-tight" style={{fontWeight:400}}>
                {product.name}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {product.is_organic && (
                  <span className="badge-green flex items-center gap-1">
                    <Leaf className="w-3 h-3" /> Organic
                  </span>
                )}
                {product.is_featured && <span className="badge-orange">Featured</span>}
                {product.tags?.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 text-gray-500">{tag}</span>
                ))}
              </div>

              {/* Rating */}
              {product.review_count > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {starArray(product.rating_average).map((s, i) => (
                      <Star
                        key={i}
                        className={cn('w-4 h-4', s === 'full' ? 'text-yellow-400 fill-current' : s === 'half' ? 'text-yellow-300' : 'text-gray-200')}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.rating_average.toFixed(1)} ({product.review_count} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-forest-green">{formatPrice(price)}</span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">per {product.unit ?? 'unit'}</p>
              </div>

              {/* Short description */}
              {product.short_description && (
                <p className="text-gray-600 text-sm leading-relaxed">{product.short_description}</p>
              )}

              {/* Stock */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-sm font-medium',
                    product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-500' : 'text-red-500'
                  )}
                >
                  <span className={cn('w-2 h-2 rounded-full', product.stock > 0 ? 'bg-current' : 'bg-red-400')} />
                  {product.stock > 0
                    ? product.stock > 10
                      ? 'In Stock'
                      : `Only ${product.stock} left`
                    : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity + CTA */}
              {product.stock > 0 && (
                <div className="flex flex-col gap-3">
                  {/* Row 1: quantity + wishlist */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-500" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        className="p-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <button
                      onClick={handleWishlistToggle}
                      className={cn(
                        'p-2.5 rounded-xl border-2 transition-all hover:scale-110',
                        wishlisted
                          ? 'border-red-300 bg-red-50 text-red-400'
                          : 'border-gray-200 text-gray-400 hover:border-red-200'
                      )}
                      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={cn('w-4 h-4', wishlisted && 'fill-current')} />
                    </button>
                  </div>

                  {/* Row 2: Add to Cart full width */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="btn-secondary w-full py-3 text-sm"
                  >
                    {addingToCart ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    Add to Cart
                  </button>
                </div>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: Truck, label: 'Free delivery\nover $50' },
                  { icon: ShieldCheck, label: 'Freshness\nguaranteed' },
                  { icon: RotateCcw, label: 'Easy\nreturns' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center">
                    <Icon className="w-4 h-4 text-forest-green" />
                    <span className="text-[10px] text-gray-500 leading-tight whitespace-pre-line">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description + Reviews */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Description */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-lg text-charcoal mb-4" style={{fontWeight:400}}>Product Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description ?? 'No description available for this product.'}
              </p>
            </div>

            {/* Nutrition / Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-lg text-charcoal mb-4" style={{fontWeight:400}}>Quick Details</h2>
              <div className="space-y-3">
                {[
                  { label: 'Unit', value: product.unit ?? '—' },
                  { label: 'Stock', value: `${product.stock} units` },
                  { label: 'Organic', value: product.is_organic ? 'Yes ✓' : 'No' },
                  { label: 'Category', value: product.category?.name ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium text-charcoal">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-lg text-charcoal mb-6" style={{fontWeight:400}}>Customer Reviews ({reviews.length})</h2>

            {/* Success toast */}
            {reviewSuccess && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl flex items-center gap-2">
                <span>✓</span> {reviewSuccess}
              </div>
            )}

            {/* Review form */}
            {user ? (
              existingReview && !isEditingReview ? (
                <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">You&apos;ve already reviewed this product</p>
                      <div className="flex gap-0.5 mb-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={cn('w-4 h-4', s <= existingReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300')} />
                        ))}
                      </div>
                      {existingReview.comment && (
                        <p className="text-sm text-amber-700 italic">&ldquo;{existingReview.comment}&rdquo;</p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditingReview(true)}
                      className="flex-shrink-0 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Edit Review
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="mb-8 p-5 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-charcoal">
                      {existingReview ? 'Edit Your Review' : 'Write a Review'}
                    </h3>
                    {existingReview && (
                      <button
                        type="button"
                        onClick={() => { setIsEditingReview(false); setReviewRating(existingReview.rating); setReviewText(existingReview.comment ?? '') }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">Your rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="transition-transform hover:scale-125"
                        >
                          <Star className={cn('w-5 h-5', star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-200')} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts about this product…"
                    rows={3}
                    className="input resize-none mb-3"
                    required
                  />
                  <button type="submit" disabled={submittingReview} className="btn-secondary text-sm">
                    {submittingReview ? 'Saving…' : existingReview ? 'Update Review' : 'Submit Review'}
                  </button>
                </form>
              )
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">
                  <Link href="/auth/signin" className="text-forest-green font-medium hover:underline">Sign in</Link>{' '}
                  to leave a review.
                </p>
              </div>
            )}

            {/* Review list */}
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-charcoal">{review.user_name}</span>
                      <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn('w-3.5 h-3.5', i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200')} />
                      ))}
                    </div>
                    {review.comment && <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="font-serif text-xl text-charcoal mb-5" style={{fontWeight:400}}>You Might Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer hideOnMobile />
    </>
  )
}
