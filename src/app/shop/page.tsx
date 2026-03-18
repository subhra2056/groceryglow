'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Grid3X3, List, SlidersHorizontal, ArrowRight } from 'lucide-react'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/components/landing/Footer'
import ProductCard from '@/components/shop/ProductCard'
import ProductFilters, { type FilterState } from '@/components/shop/ProductFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Product, Category } from '@/types'

// Emoji icons for categories that have no image
const CATEGORY_ICONS: Record<string, string> = {
  'fresh-fruits': '🍎',
  vegetables: '🥦',
  dairy: '🥛',
  bakery: '🍞',
  'meat-seafood': '🥩',
  beverages: '🧃',
  snacks: '🍿',
  organic: '🌿',
}

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') ?? '',
    minPrice: 0,
    maxPrice: 100,
    onlyOrganic: false,
    onlyFeatured: false,
    sortBy: 'default',
  })

  const view = searchParams.get('view')
  const isCategoriesView = view === 'categories'

  // Track previous searchParams key so we only reset filters on genuine navigation
  const prevSearchKey = useRef(searchParams.toString())

  useEffect(() => {
    const currentKey = searchParams.toString()
    if (currentKey === prevSearchKey.current) return
    prevSearchKey.current = currentKey

    // Reset filter state to match new URL when navigating via navbar
    setFilters({
      category: searchParams.get('category') ?? '',
      minPrice: 0,
      maxPrice: 100,
      onlyOrganic: false,
      onlyFeatured: false,
      sortBy: 'default',
    })
  }, [searchParams])

  // Fetch categories for the categories view
  useEffect(() => {
    if (!isCategoriesView) return
    setLoading(true)
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => {
        setCategories(data ?? [])
        setLoading(false)
      })
  }, [isCategoriesView])

  const fetchProducts = useCallback(async () => {
    if (isCategoriesView) return
    setLoading(true)
    const supabase = createClient()

    let query = supabase.from('products').select('*, category:categories(*)')

    // Search
    const search = searchParams.get('search')
    if (search) query = query.ilike('name', `%${search}%`)

    // Category filter (from sidebar state)
    if (filters.category) {
      if (filters.category === 'organic') {
        // "Organic" is a virtual category — filter by is_organic flag
        query = query.eq('is_organic', true)
      } else {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', filters.category)
          .single()
        if (cat) query = query.eq('category_id', cat.id)
      }
    }

    // Tag filter (from URL param — used by Offers link)
    const tag = searchParams.get('tag')
    if (tag) query = query.contains('tags', [tag])

    // Price range
    query = query.gte('price', filters.minPrice).lte('price', filters.maxPrice)

    // Type filters
    if (filters.onlyOrganic) query = query.eq('is_organic', true)
    if (filters.onlyFeatured) query = query.eq('is_featured', true)

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'rating':
        query = query.order('rating_average', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
    }

    const { data } = await query
    setProducts(data ?? [])
    setLoading(false)
  }, [filters, searchParams, isCategoriesView])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // ── Page title ──────────────────────────────────────────────────
  const search = searchParams.get('search')
  const tag = searchParams.get('tag')
  const pageTitle = isCategoriesView
    ? 'All Categories'
    : search
    ? `Search results for "${search}"`
    : tag
    ? `${tag.charAt(0).toUpperCase() + tag.slice(1)} Deals`
    : filters.category
    ? filters.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'All Products'

  // ── Categories view ─────────────────────────────────────────────
  if (isCategoriesView) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-cream pb-16">
          <div className="bg-gradient-hero py-10">
            <div className="container-app text-white">
              <p className="text-white/70 text-sm mb-1">
                <span
                  className="hover:text-white cursor-pointer"
                  onClick={() => router.push('/')}
                >
                  Home
                </span>{' '}
                /{' '}
                <span
                  className="hover:text-white cursor-pointer"
                  onClick={() => router.push('/shop')}
                >
                  Shop
                </span>{' '}
                / <span>Categories</span>
              </p>
              <h1 className="text-3xl font-black">All Categories</h1>
              {!loading && (
                <p className="text-white/70 text-sm mt-1">
                  {categories.length} categories available
                </p>
              )}
            </div>
          </div>

          <div className="container-app mt-8">
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/shop?category=${cat.slug}`)}
                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-card transition-all hover:-translate-y-1 text-left"
                  >
                    <div className="text-4xl mb-3">
                      {CATEGORY_ICONS[cat.slug] ?? '🛒'}
                    </div>
                    <h3 className="font-bold text-charcoal text-sm group-hover:text-forest-green transition-colors">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-3 text-forest-green text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Browse <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    )
  }

  // ── Normal products view ────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pb-16">
        {/* Page header */}
        <div className="bg-gradient-hero py-10">
          <div className="container-app text-white">
            <p className="text-white/70 text-sm mb-1">
              <span
                className="hover:text-white cursor-pointer"
                onClick={() => router.push('/')}
              >
                Home
              </span>{' '}
              / <span>Shop</span>
            </p>
            <h1 className="text-3xl font-black">{pageTitle}</h1>
            {!loading && (
              <p className="text-white/70 text-sm mt-1">
                {products.length} products found
              </p>
            )}
          </div>
        </div>

        <div className="container-app mt-8">
          {/* Desktop sort bar */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <SlidersHorizontal className="w-4 h-4" />
              Showing{' '}
              <span className="font-semibold text-charcoal">{products.length}</span>{' '}
              results
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, sortBy: e.target.value as FilterState['sortBy'] }))
                }
                className="input py-2 w-48 text-sm"
              >
                <option value="default">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>

              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-forest-green text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-forest-green text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <ProductFilters
              filters={filters}
              onChange={setFilters}
              totalCount={products.length}
            />

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <LoadingSpinner size="lg" />
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                  <span className="text-5xl block mb-4">🔍</span>
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your filters or search query.
                  </p>
                </div>
              ) : (
                <div
                  className={cn(
                    viewMode === 'grid'
                      ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'flex flex-col gap-4'
                  )}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  )
}
