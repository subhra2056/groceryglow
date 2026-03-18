import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'

const deals = [
  {
    title: 'Organic Fruit Box',
    subtitle: 'Seasonal selection, hand-picked daily',
    badge: '25% OFF',
    emoji: '🍓',
    href: '/shop?category=fresh-fruits&tag=offer',
    gradient: 'from-red-400 to-orange-400',
    bg: 'bg-gradient-to-br from-orange-50 to-red-50',
    border: 'border-orange-100',
  },
  {
    title: 'Fresh Veggies Bundle',
    subtitle: 'Farm-to-table, delivered same day',
    badge: '20% OFF',
    emoji: '🥦',
    href: '/shop?category=vegetables&tag=offer',
    gradient: 'from-green-400 to-emerald-500',
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-100',
  },
  {
    title: 'Dairy Essentials Pack',
    subtitle: 'Milk, cheese, yogurt & more',
    badge: '15% OFF',
    emoji: '🧀',
    href: '/shop?category=dairy&tag=offer',
    gradient: 'from-blue-400 to-cyan-400',
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    border: 'border-blue-100',
  },
]

export default function FreshOffers() {
  return (
    <section className="py-16 md:py-20 bg-cream">
      <div className="container-app">
        {/* Header */}
        <div className="text-center mb-12">
          <div data-animate className="inline-flex items-center gap-2 bg-sunset-orange/10 text-sunset-orange rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Tag className="w-4 h-4" />
            Limited Time Offers
          </div>
          <h2 data-animate className="section-title mx-auto anim-d1">Fresh Deals Just for You</h2>
          <p data-animate className="section-subtitle mx-auto text-center anim-d2">
            Handpicked discounts on our most popular categories. Don&apos;t miss out!
          </p>
        </div>

        {/* Featured banner — full width */}
        <div data-animate className="relative bg-gradient-hero rounded-3xl overflow-hidden p-8 md:p-12 mb-6 flex items-center justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-leaf-green/20 rounded-full translate-y-1/2" />

          <div className="relative z-10 text-white max-w-lg">
            <span className="inline-block bg-sunset-orange text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              🔥 Hot Deal of the Week
            </span>
            <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
              Get 30% Off Your First Order
            </h3>
            <p className="text-white/80 text-base mb-6">
              New customers save big on every item in their first basket. Fresh, organic, delivered
              fast.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-white text-forest-green font-bold px-6 py-3 rounded-full hover:bg-cream transition-colors shadow-lg"
            >
              Claim Your Discount <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="hidden md:block text-8xl animate-float relative z-10">🛒</div>
        </div>

        {/* Three deal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deals.map((deal, i) => (
            <Link
              key={deal.title}
              href={deal.href}
              data-animate
              className={`anim-d${i + 1} group ${deal.bg} border ${deal.border} rounded-2xl p-6 flex items-center gap-4 hover:-translate-y-1 hover:shadow-card transition-all duration-300`}
            >
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                {deal.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`inline-block bg-gradient-to-r ${deal.gradient} text-white text-xs font-bold px-2.5 py-0.5 rounded-full mb-2`}>
                  {deal.badge}
                </div>
                <h4 className="font-bold text-charcoal text-base leading-tight">{deal.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{deal.subtitle}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-forest-green group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
