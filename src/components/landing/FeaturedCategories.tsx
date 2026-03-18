import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  { name: 'Fresh Fruits', slug: 'fresh-fruits', emoji: '🍎', count: '120+ items', color: 'from-red-100 to-orange-50', border: 'border-red-100' },
  { name: 'Vegetables', slug: 'vegetables', emoji: '🥦', count: '90+ items', color: 'from-green-100 to-emerald-50', border: 'border-green-100' },
  { name: 'Dairy & Eggs', slug: 'dairy', emoji: '🥛', count: '60+ items', color: 'from-blue-50 to-cyan-50', border: 'border-blue-100' },
  { name: 'Bakery', slug: 'bakery', emoji: '🍞', count: '45+ items', color: 'from-yellow-50 to-amber-50', border: 'border-yellow-100' },
  { name: 'Meat & Seafood', slug: 'meat-seafood', emoji: '🥩', count: '80+ items', color: 'from-rose-50 to-pink-50', border: 'border-rose-100' },
  { name: 'Beverages', slug: 'beverages', emoji: '🧃', count: '100+ items', color: 'from-purple-50 to-violet-50', border: 'border-purple-100' },
  { name: 'Snacks', slug: 'snacks', emoji: '🍿', count: '70+ items', color: 'from-orange-50 to-yellow-50', border: 'border-orange-100' },
  { name: 'Organic', slug: 'organic', emoji: '🌿', count: '50+ items', color: 'from-emerald-50 to-teal-50', border: 'border-emerald-100' },
]

export default function FeaturedCategories() {
  return (
    <section className="py-16 md:py-20 bg-cream">
      <div className="container-app">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sunset-orange text-sm font-semibold uppercase tracking-widest mb-2">
              Browse by Category
            </p>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">
              Explore our wide range of fresh, organic produce and pantry staples.
            </p>
          </div>
          <Link
            href="/shop?view=categories"
            className="hidden md:flex items-center gap-1.5 text-forest-green font-semibold text-sm hover:gap-3 transition-all"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className={`group relative bg-gradient-to-br ${cat.color} border ${cat.border} rounded-2xl p-5 flex flex-col items-center gap-3 hover:-translate-y-1 hover:shadow-card transition-all duration-300 overflow-hidden`}
            >
              {/* Decorative circle */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/40 rounded-full" />

              <span className="text-5xl z-10 group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </span>
              <div className="text-center z-10">
                <p className="font-semibold text-charcoal text-sm md:text-base">{cat.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile show all */}
        <div className="mt-6 text-center md:hidden">
          <Link href="/shop?view=categories" className="btn-outline">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  )
}
