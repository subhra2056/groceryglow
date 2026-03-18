import Link from 'next/link'
import { ArrowRight, ShieldCheck, Truck, Star } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
      {/* Background decorative blobs */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-5 w-56 h-56 bg-leaf-green/20 rounded-full blur-2xl" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="container-app relative z-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* ── Left — Text ── */}
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 text-sm font-medium">
              <span className="w-2 h-2 bg-leaf-green rounded-full animate-pulse" />
              Fresh Deliveries Every Day
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
              Shop Fresh.
              <br />
              <span className="text-sunset-orange drop-shadow-lg">Live Healthy.</span>
              <br />
              Glow Daily.
            </h1>

            <p className="text-white/80 text-lg md:text-xl leading-relaxed max-w-md">
              Premium organic groceries sourced directly from local farms. Delivered to your door
              in under 2 hours — guaranteed fresh, every single time.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/shop" className="btn-primary text-base px-8 py-3.5 shadow-glow">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?view=categories"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/15 border border-white/30 text-white font-semibold text-base hover:bg-white/25 transition-all duration-200"
              >
                Explore Categories
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-5 pt-4">
              {[
                { icon: Truck, label: 'Free delivery over $50' },
                { icon: ShieldCheck, label: '100% organic certified' },
                { icon: Star, label: '4.9★ from 12k reviews' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-white/75 text-sm">
                  <Icon className="w-4 h-4 text-leaf-green" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — Visual Card ── */}
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-3xl p-8 w-80 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { emoji: '🍎', name: 'Fresh Apples', price: '$2.49', color: 'bg-red-50' },
                    { emoji: '🥦', name: 'Broccoli', price: '$1.89', color: 'bg-green-50' },
                    { emoji: '🥕', name: 'Carrots', price: '$1.29', color: 'bg-orange-50' },
                    { emoji: '🍋', name: 'Lemons', price: '$3.99', color: 'bg-yellow-50' },
                    { emoji: '🍇', name: 'Grapes', price: '$4.49', color: 'bg-purple-50' },
                    { emoji: '🍅', name: 'Tomatoes', price: '$2.19', color: 'bg-red-50' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center gap-1 hover:scale-105 transition-transform cursor-pointer"
                    >
                      <span className="text-3xl animate-float">{item.emoji}</span>
                      <span className="text-[10px] font-semibold text-charcoal text-center leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[11px] font-bold text-forest-green">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badge — discount */}
              <div className="absolute -top-4 -right-4 bg-sunset-orange text-white rounded-2xl px-3 py-2 shadow-lg animate-float">
                <p className="text-[10px] font-medium opacity-90">Today&apos;s Deal</p>
                <p className="text-lg font-black">30% OFF</p>
              </div>

              {/* Floating badge — delivery */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-forest-green" />
                <div>
                  <p className="text-[10px] text-gray-400">Delivery</p>
                  <p className="text-xs font-bold text-charcoal">Within 2 hrs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 60L1440 60L1440 20C1200 60 720 0 0 40V60Z"
            fill="#FFF8EE"
          />
        </svg>
      </div>
    </section>
  )
}
