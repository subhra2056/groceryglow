'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ProductCard from '@/components/shop/ProductCard'
import type { Product } from '@/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function BestSelling() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_featured', true)
      .order('review_count', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setProducts(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container-app">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p data-animate className="text-sunset-orange text-sm font-medium uppercase tracking-widest mb-2">
              Top Picks
            </p>
            <h2 data-animate className="section-title anim-d1">Best Selling Products</h2>
            <p data-animate className="section-subtitle anim-d2">
              The freshest items our customers love most, week after week.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden md:flex items-center gap-1.5 text-forest-green font-medium text-sm hover:gap-3 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🥦</p>
            <p className="text-gray-400">Products are being stocked. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <div key={product.id} data-animate className={`anim-d${Math.min(i + 1, 8)}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link href="/shop" className="btn-secondary">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
