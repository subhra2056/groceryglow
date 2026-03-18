import { Leaf, Truck, ShieldCheck, Clock, HeartHandshake, Recycle } from 'lucide-react'

const features = [
  {
    icon: Leaf,
    title: '100% Organic',
    description: 'Every product is certified organic and sourced directly from trusted local farms.',
    color: 'bg-green-50 text-leaf-green',
  },
  {
    icon: Truck,
    title: 'Free Fast Delivery',
    description: 'Free delivery on orders over $50. Same-day delivery within a 20-mile radius.',
    color: 'bg-blue-50 text-blue-500',
  },
  {
    icon: ShieldCheck,
    title: 'Freshness Guaranteed',
    description: "Not happy? We'll replace or refund — no questions asked.",
    color: 'bg-forest-green/10 text-forest-green',
  },
  {
    icon: Clock,
    title: 'Delivered in 2 Hours',
    description: 'Order before noon and have fresh groceries at your door the same afternoon.',
    color: 'bg-orange-50 text-sunset-orange',
  },
  {
    icon: HeartHandshake,
    title: 'Supporting Local Farmers',
    description: 'Every purchase directly supports local farmers and sustainable agriculture.',
    color: 'bg-rose-50 text-rose-500',
  },
  {
    icon: Recycle,
    title: 'Eco-Friendly Packaging',
    description: 'Fully recyclable and biodegradable packaging for a greener tomorrow.',
    color: 'bg-teal-50 text-teal-600',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container-app">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            <p data-animate className="text-sunset-orange text-sm font-medium uppercase tracking-widest mb-2">
              Why GroceryGlow
            </p>
            <h2 data-animate className="section-title mb-4 anim-d1">
              The Freshest Choice
              <br />
              <span className="text-gradient">for Your Family</span>
            </h2>
            <p data-animate className="text-gray-500 text-base leading-relaxed mb-8 max-w-md anim-d2">
              We obsess over quality so you don&apos;t have to. Every item is hand-selected,
              temperature-controlled during transit, and delivered with care.
            </p>

            {/* Stats */}
            <div data-animate className="grid grid-cols-3 gap-4 anim-d3">
              {[
                { value: '50k+', label: 'Happy Customers' },
                { value: '500+', label: 'Products' },
                { value: '4.9★', label: 'Average Rating' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="font-serif text-2xl text-forest-green" style={{fontWeight:400}}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                data-animate
                className={`anim-d${i + 1} bg-white rounded-2xl p-5 shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-3`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-charcoal text-sm mb-1">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
