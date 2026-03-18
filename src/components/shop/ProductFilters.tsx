'use client'

import { useEffect, useState } from 'react'
import { Filter, ChevronDown, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

export interface FilterState {
  category: string
  minPrice: number
  maxPrice: number
  onlyOrganic: boolean
  onlyFeatured: boolean
  sortBy: 'default' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

interface ProductFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  totalCount: number
}

const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
]

export default function ProductFilters({ filters, onChange, totalCount }: ProductFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .order('name')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  const update = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial })

  const activeFilterCount = [
    filters.category !== '',
    filters.onlyOrganic,
    filters.onlyFeatured,
    filters.minPrice > 0,
    filters.maxPrice < 100,
  ].filter(Boolean).length

  const clearAll = () =>
    onChange({ category: '', minPrice: 0, maxPrice: 100, onlyOrganic: false, onlyFeatured: false, sortBy: 'default' })

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort (mobile only — desktop has separate sort bar) */}
      <div className="md:hidden">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Sort By
        </h3>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => update({ sortBy: opt.value })}
              className={cn(
                'text-left text-sm py-1.5 px-3 rounded-lg transition-colors',
                filters.sortBy === opt.value
                  ? 'bg-forest-green/10 text-forest-green font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Category
        </h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => update({ category: '' })}
            className={cn(
              'text-left text-sm py-1.5 px-3 rounded-lg transition-colors',
              filters.category === ''
                ? 'bg-forest-green/10 text-forest-green font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => update({ category: cat.slug })}
              className={cn(
                'text-left text-sm py-1.5 px-3 rounded-lg transition-colors',
                filters.category === cat.slug
                  ? 'bg-forest-green/10 text-forest-green font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Price Range
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Min (₹)</label>
              <input
                type="number"
                min={0}
                max={filters.maxPrice - 1}
                value={filters.minPrice}
                onChange={(e) => update({ minPrice: Number(e.target.value) })}
                className="input text-xs py-2"
              />
            </div>
            <span className="text-gray-300 mt-4">—</span>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Max (₹)</label>
              <input
                type="number"
                min={filters.minPrice + 1}
                max={200}
                value={filters.maxPrice}
                onChange={(e) => update({ maxPrice: Number(e.target.value) })}
                className="input text-xs py-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Product Type
        </h3>
        <div className="space-y-2">
          {[
            { key: 'onlyOrganic' as const, label: 'Organic Only' },
            { key: 'onlyFeatured' as const, label: 'Featured Products' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                className={cn(
                  'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  filters[key]
                    ? 'bg-forest-green border-forest-green'
                    : 'border-gray-300 group-hover:border-forest-green'
                )}
                onClick={() => update({ [key]: !filters[key] })}
              >
                {filters[key] && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-600 select-none">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="w-full text-sm text-red-500 font-medium py-2 border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" /> Clear All Filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* ── Mobile filter bar ── */}
      <div className="md:hidden flex items-center gap-2 mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors',
            activeFilterCount > 0
              ? 'border-forest-green bg-forest-green/5 text-forest-green'
              : 'border-gray-200 bg-white text-gray-700 hover:border-forest-green'
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-forest-green text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort dropdown */}
        <div className="relative flex-1">
          <button
            onClick={() => setSortOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700"
          >
            <span>{SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label ?? 'Sort'}</span>
            <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', sortOpen && 'rotate-180')} />
          </button>
          {sortOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-card overflow-hidden z-10">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { update({ sortBy: opt.value }); setSortOpen(false) }}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm transition-colors',
                    filters.sortBy === opt.value
                      ? 'bg-forest-green/10 text-forest-green font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-gray-400 whitespace-nowrap">{totalCount} items</span>
      </div>

      {/* ── Mobile filter drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-semibold text-charcoal">Filters</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-5">
              <FilterContent />
            </div>
            <div className="p-5 border-t border-gray-100">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full btn-secondary"
              >
                Show {totalCount} Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:block w-44 lg:w-52 flex-shrink-0">
        <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-charcoal text-sm flex items-center gap-2">
              <Filter className="w-4 h-4 text-forest-green" />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 bg-forest-green text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </h2>
          </div>
          <FilterContent />
        </div>
      </aside>
    </>
  )
}
