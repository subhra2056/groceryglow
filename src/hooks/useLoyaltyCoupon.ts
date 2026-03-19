'use client'

import { useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const LOYALTY_COUPON_INTERVAL_DAYS = 2
const LOYALTY_COUPON_EXPIRY_DAYS = 4

export function useLoyaltyCoupon(user: User | null) {
  useEffect(() => {
    if (!user?.id) return

    const run = async () => {
      const supabase = createClient()
      const loyaltyWindowStart = new Date(
        Date.now() - LOYALTY_COUPON_INTERVAL_DAYS * 24 * 60 * 60 * 1000
      ).toISOString()

      // Check if a personal coupon was created in the last 2 days
      const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', loyaltyWindowStart)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existing) return // Already has a recent loyalty coupon

      // Generate unique code
      const code = `LOYAL${Date.now().toString(36).slice(-6).toUpperCase()}`
      const expiresAt = new Date(
        Date.now() + LOYALTY_COUPON_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      ).toISOString()

      // Insert coupon
      const { error: couponError } = await supabase.from('coupons').insert({
        code,
        user_id: user.id,
        discount_amount: 40,
        min_order_amount: 200,
        is_active: true,
        expires_at: expiresAt,
      })

      if (couponError) {
        // Silently skip - coupons table may not be set up yet
        return
      }

      // Insert notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'promo',
        title: 'Loyalty Coupon Unlocked!',
        message: `Use code ${code} for Rs.40 off on orders above Rs.200. Valid for 4 days!`,
        data: { coupon_code: code },
      })
    }

    run()
  }, [user?.id])
}
