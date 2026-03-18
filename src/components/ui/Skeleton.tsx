import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

// ── Base skeleton block ────────────────────────────────────────────────────────
function SkeletonBlock({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-gray-200 rounded', className)}
      aria-hidden="true"
    />
  )
}

// ── Single text line skeleton ─────────────────────────────────────────────────
export function SkeletonText({ className }: SkeletonProps) {
  return <SkeletonBlock className={cn('h-4 rounded-md', className)} />
}

// ── Product card skeleton ─────────────────────────────────────────────────────
export function SkeletonProductCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-2xl overflow-hidden shadow-sm', className)}>
      {/* Image area */}
      <SkeletonBlock className="w-full h-40 rounded-none" />
      {/* Text area */}
      <div className="p-3 space-y-2">
        <SkeletonBlock className="h-3.5 w-3/4 rounded-md" />
        <SkeletonBlock className="h-3 w-1/2 rounded-md" />
        <div className="flex items-center justify-between pt-1">
          <SkeletonBlock className="h-5 w-16 rounded-md" />
          <SkeletonBlock className="h-7 w-7 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ── Product grid skeleton (6 cards) ──────────────────────────────────────────
export function SkeletonProductGrid({ className }: SkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4', className)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  )
}

// ── Order card skeleton ───────────────────────────────────────────────────────
export function SkeletonOrderCard({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-5 shadow-sm', className)}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="space-y-1.5">
          <SkeletonBlock className="h-3 w-12 rounded-md" />
          <SkeletonBlock className="h-4 w-28 rounded-md" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-20 rounded-full" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
        </div>
      </div>
      {/* Items row */}
      <div className="flex gap-2 mb-3">
        <SkeletonBlock className="h-6 w-24 rounded-lg" />
        <SkeletonBlock className="h-6 w-20 rounded-lg" />
      </div>
      {/* Footer row */}
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-24 rounded-md" />
        <SkeletonBlock className="h-5 w-16 rounded-md" />
      </div>
    </div>
  )
}
