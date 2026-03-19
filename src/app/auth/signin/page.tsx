'use client'
export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Leaf, ShieldX, Copy, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const SUPPORT_EMAIL = 'support@groceryglow.com'

function BlockedModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-fade-up">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Blocked</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          Your account has been temporarily suspended. Please contact our support team to resolve this.
        </p>

        {/* Support email box */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 flex-1 text-left">{SUPPORT_EMAIL}</span>
          <button
            onClick={copyEmail}
            className="text-xs text-forest-green font-medium flex items-center gap-1 hover:text-green-700 transition-colors"
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-5 py-3 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

function SignInContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/'

  const [blocked, setBlocked] = useState(() => searchParams.get('blocked') === '1')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: err } = await signIn(email, password)
    if (err) {
      if (err === 'ACCOUNT_BLOCKED') {
        setBlocked(true)
      } else {
        setError(err)
      }
      setLoading(false)
      return
    }

    router.push(redirectTo)
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {blocked && <BlockedModal onClose={() => setBlocked(false)} />}
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Grocery<span className="text-sunset-orange">Glow</span>
          </span>
        </Link>

        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Fresh groceries,
            <br />
            delivered to your door.
          </h2>
          <p className="text-white/70 text-lg">
            Sign in to access your cart, wishlist, order history, and more.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            {['🍎 Organic Produce', '🚚 Fast Delivery', '⭐ 4.9★ Rating'].map((item) => (
              <span key={item} className="bg-white/15 text-white text-sm px-4 py-2 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-sm">© {new Date().getFullYear()} GroceryGlow</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-forest-green to-leaf-green rounded-xl flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-forest-green">
              Grocery<span className="text-sunset-orange">Glow</span>
            </span>
          </Link>

          <h1 className="font-serif text-2xl text-charcoal mb-1" style={{fontWeight:400}}>Welcome back</h1>
          <p className="text-gray-400 text-xs tracking-wide mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-600">Password</label>
                {/* <button type="button" className="text-xs text-forest-green hover:underline">
                  Forgot password?
                </button> */}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-secondary w-full justify-center mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-forest-green font-medium hover:underline">
              Sign up free
            </Link>
          </p>

          <Link href="/" className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-4 hover:text-forest-green transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  )
}
