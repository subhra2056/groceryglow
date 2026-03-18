const steps = [
  {
    step: '01',
    emoji: '🔍',
    title: 'Browse & Choose',
    description:
      'Explore hundreds of fresh products across categories. Filter by organic, price, and more.',
    color: 'bg-green-50 border-green-100',
    stepColor: 'text-forest-green',
  },
  {
    step: '02',
    emoji: '🛒',
    title: 'Add to Cart',
    description:
      'Add your favourites to the cart, apply coupon codes, and review your order summary.',
    color: 'bg-orange-50 border-orange-100',
    stepColor: 'text-sunset-orange',
  },
  {
    step: '03',
    emoji: '📍',
    title: 'Set Your Address',
    description:
      'Enter your delivery address or pick from your saved locations for speedy checkout.',
    color: 'bg-blue-50 border-blue-100',
    stepColor: 'text-blue-600',
  },
  {
    step: '04',
    emoji: '🚚',
    title: 'Fast Delivery',
    description:
      'Sit back and relax. Your fresh groceries arrive at your doorstep within 2 hours.',
    color: 'bg-purple-50 border-purple-100',
    stepColor: 'text-purple-600',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-app">
        <div className="text-center mb-12">
          <p className="text-sunset-orange text-sm font-semibold uppercase tracking-widest mb-2">
            Simple Process
          </p>
          <h2 className="section-title mx-auto">How GroceryGlow Works</h2>
          <p className="section-subtitle mx-auto text-center">
            From click to doorstep in four easy steps. Fresh groceries have never been this simple.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-0.5 bg-gradient-to-r from-forest-green/20 via-sunset-orange/30 to-forest-green/20" />

          {steps.map((step, i) => (
            <div
              key={step.step}
              className={`relative ${step.color} border rounded-2xl p-6 text-center hover:-translate-y-1 hover:shadow-card transition-all duration-300`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Step number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-full w-7 h-7 flex items-center justify-center shadow-sm">
                <span className={`text-[10px] font-black ${step.stepColor}`}>{step.step}</span>
              </div>

              <span className="text-5xl block mb-4 mt-3">{step.emoji}</span>
              <h3 className="font-bold text-charcoal text-base mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
