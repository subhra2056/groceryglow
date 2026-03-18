'use client'

import { Ticket, Copy, Check } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface CouponRow {
  id: string
  code: string
  discount_amount: number
  min_order_amount: number
  is_used: boolean
  is_active: boolean
  expires_at: string | null
  created_at: string
}

interface CouponsTabProps {
  coupons: CouponRow[]
  dataLoading: boolean
  copiedCode: string | null
  copyCode: (code: string) => Promise<void>
}

export default function CouponsTab({ coupons, dataLoading, copiedCode, copyCode }: CouponsTabProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-lg font-bold text-charcoal">My Coupons</h2>
        {coupons.filter((c) => !c.is_used && !(c.expires_at && new Date(c.expires_at) < new Date())).length > 0 && (
          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
            {coupons.filter((c) => !c.is_used && !(c.expires_at && new Date(c.expires_at) < new Date())).length} active
          </span>
        )}
      </div>
      {dataLoading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Ticket className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-600 font-semibold text-sm">No coupons yet</p>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed">
            Loyalty coupons arrive every 5 days.<br />New users get NEWBIE100 on signup.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((c) => {
            const expired = c.expires_at ? new Date(c.expires_at) < new Date() : false
            const status = c.is_used ? 'used' : expired ? 'expired' : 'active'
            const isActive = status === 'active'
            return (
              <div
                key={c.id}
                className={`relative flex rounded-2xl overflow-hidden shadow-sm transition-opacity ${!isActive ? 'opacity-50' : ''}`}
              >
                {/* Left panel — discount amount */}
                <div
                  className={`flex flex-col items-center justify-center px-4 sm:px-6 py-5 flex-shrink-0 min-w-[80px] sm:min-w-[96px] ${
                    isActive
                      ? 'bg-gradient-to-b from-forest-green to-leaf-green'
                      : 'bg-gray-300'
                  }`}
                >
                  <span className="text-white font-black text-2xl sm:text-3xl leading-none">₹{c.discount_amount}</span>
                  <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">OFF</span>
                </div>

                {/* Perforated divider */}
                <div className="relative flex-shrink-0 flex items-center" style={{ width: '20px' }}>
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-cream`} />
                  <div className={`w-px h-full border-l-2 border-dashed mx-auto ${isActive ? 'border-forest-green/25' : 'border-gray-200'}`} />
                  <div className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-cream`} />
                </div>

                {/* Right panel — code & details */}
                <div className={`flex-1 flex flex-col justify-between px-4 py-4 min-w-0 ${isActive ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Code + status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono font-bold text-sm sm:text-base tracking-widest ${isActive ? 'text-charcoal' : 'text-gray-400'}`}>
                          {c.code}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : status === 'used'
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-red-50 text-red-400'
                          }`}
                        >
                          {status === 'active' ? '✓ Active' : status === 'used' ? 'Used' : 'Expired'}
                        </span>
                      </div>
                      {/* Description */}
                      <p className="text-xs text-gray-500 mt-1.5">
                        Get <span className="font-semibold text-charcoal">₹{c.discount_amount} off</span> on orders above ₹{c.min_order_amount}
                      </p>
                      {/* Expiry */}
                      {c.expires_at && (
                        <p className={`text-[11px] mt-1 flex items-center gap-1 ${status === 'expired' ? 'text-red-400' : 'text-gray-400'}`}>
                          🗓 {status === 'expired' ? 'Expired on' : 'Valid till'}{' '}
                          {new Date(c.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Copy button */}
                    {isActive && (
                      <button
                        onClick={() => copyCode(c.code)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all ${
                          copiedCode === c.code
                            ? 'bg-green-100 text-green-600 scale-95'
                            : 'bg-forest-green/8 border border-forest-green/20 text-forest-green hover:bg-forest-green/15'
                        }`}
                      >
                        {copiedCode === c.code
                          ? <><Check className="w-4 h-4" /><span>Copied!</span></>
                          : <><Copy className="w-4 h-4" /><span>Copy</span></>
                        }
                      </button>
                    )}
                  </div>

                  {/* Bottom: min order note */}
                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex items-center gap-1.5">
                      <Ticket className="w-3 h-3 text-gray-300 flex-shrink-0" />
                      <p className="text-[10px] text-gray-400">Min. order ₹{c.min_order_amount} · Apply at checkout</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
