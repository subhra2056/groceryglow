'use client'

import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-hero relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-leaf-green/20 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="container-app relative z-10">
        <div className="max-w-xl mx-auto text-center text-white">
          <div data-animate className="inline-flex items-center justify-center w-14 h-14 bg-white/15 rounded-2xl mb-6">
            <Mail className="w-7 h-7 text-white" />
          </div>

          <h2 data-animate className="font-serif text-3xl md:text-4xl mb-3 anim-d1" style={{fontWeight: 400}}>
            Get Fresh Deals in Your Inbox
          </h2>
          <p data-animate className="text-white/75 text-base mb-8 anim-d2">
            Subscribe to our newsletter and be the first to know about exclusive discounts,
            seasonal specials, and new arrivals.
          </p>

          {submitted ? (
            <div data-animate className="flex items-center justify-center gap-3 bg-white/15 border border-white/30 rounded-2xl px-6 py-4">
              <CheckCircle2 className="w-6 h-6 text-leaf-green" />
              <p className="font-semibold">
                You&apos;re subscribed! Watch your inbox for fresh deals 🎉
              </p>
            </div>
          ) : (
            <form data-animate onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 anim-d3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-3.5 bg-sunset-orange text-white font-semibold text-sm rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-70 flex-shrink-0 shadow-md"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Subscribe <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-white/50 text-xs mt-4">
            No spam, ever. Unsubscribe with one click anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
