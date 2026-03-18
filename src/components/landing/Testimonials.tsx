import { Star } from 'lucide-react'
import { createClient, createServiceClient } from '@/lib/supabase/server'

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < count ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

const AVATAR_COLORS = [
  'bg-green-100 text-forest-green',
  'bg-orange-100 text-sunset-orange',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
  'bg-yellow-100 text-yellow-700',
]

export default async function Testimonials() {
  const supabase = await createClient()
  const service = createServiceClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, product:products(name)')
    .order('created_at', { ascending: false })
    .limit(4)

  // Fetch real full names via service client (bypasses RLS on profiles)
  let profileNames: Record<string, string> = {}
  if (reviews && reviews.length > 0) {
    const userIds = [...new Set(reviews.map((r) => r.user_id).filter(Boolean))]
    const { data: profiles } = await service
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)
    if (profiles) {
      profileNames = Object.fromEntries(
        profiles.map((p) => [p.id, p.full_name]).filter(([, name]) => name)
      )
    }
  }

  // Aggregate rating stats
  const { data: allRatings } = await supabase.from('reviews').select('rating')
  const total = allRatings?.length ?? 0
  const avg = total > 0
    ? (allRatings!.reduce((s, r) => s + r.rating, 0) / total).toFixed(1)
    : null

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => {
    const count = allRatings?.filter((r) => r.rating === star).length ?? 0
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return { star, pct }
  })

  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container-app text-center">
          <p className="text-sunset-orange text-sm font-semibold uppercase tracking-widest mb-2">
            What Customers Say
          </p>
          <h2 className="section-title mx-auto">Customer Reviews</h2>
          <p className="section-subtitle mx-auto text-center mt-4 text-gray-400">
            No reviews yet — be the first to shop and share your experience!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-app">
        <div className="text-center mb-12">
          <p data-animate className="text-sunset-orange text-sm font-medium uppercase tracking-widest mb-2">
            What Customers Say
          </p>
          <h2 data-animate className="section-title mx-auto anim-d1">Loved by Our Customers</h2>
          <p data-animate className="section-subtitle mx-auto text-center anim-d2">
            Real reviews from real shoppers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, i) => {
            const displayName = profileNames[review.user_id] || review.user_name || 'Customer'
            const initials = displayName
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
            return (
              <div
                key={review.id}
                data-animate
                className={`anim-d${i + 1} bg-cream rounded-2xl p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm">{displayName}</p>
                    {review.product && (
                      <p className="text-xs text-gray-400">{review.product.name}</p>
                    )}
                    <Stars count={review.rating} />
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-4 text-gray-600 text-sm leading-relaxed italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Overall rating */}
        {avg && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <div>
              <p className="text-5xl font-bold text-forest-green">{avg}</p>
              <Stars count={Math.round(Number(avg))} />
              <p className="text-xs text-gray-400 mt-1">Based on {total} review{total !== 1 ? 's' : ''}</p>
            </div>
            <div className="hidden sm:block h-12 w-px bg-gray-200" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {ratingBuckets.map(({ star, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-gray-500 w-14">{star} star{star !== 1 ? 's' : ''}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-forest-green rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-gray-400 w-8">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
