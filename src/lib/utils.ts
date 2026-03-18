// ─────────────────────────────────────────────
// GroceryGlow — Utility Helpers
// ─────────────────────────────────────────────

/** Format a number as INR currency string */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Calculate discount percentage */
export function discountPercent(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100)
}

/** Get the effective price (discounted if available) */
export function effectivePrice(product: { price: number; discount_price: number | null }): number {
  return product.discount_price ?? product.price
}

/** Generate a simple order number */
export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `GG-${ts}-${rand}`
}

/** Truncate a string to maxLen characters */
export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

/** Combine class names (simple clsx replacement) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Get first image from product images array, or placeholder */
export function productImage(images: string[] | null): string {
  if (images && images.length > 0 && images[0]) return images[0]
  return '/placeholder-product.svg'
}

/** Compute star array for a given rating (1-5) */
export function starArray(rating: number): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) stars.push('full')
    else if (rating >= i - 0.5) stars.push('half')
    else stars.push('empty')
  }
  return stars
}

/** Format a date string to readable form */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Status badge colour map */
export const ORDER_STATUS_COLORS: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  packed: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}
