'use client'

import { useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useLoyaltyCoupon(user: User | null) {
  useEffect(() => {
    if (!user?.id) return

    const run = async () => {
      const supabase = createClient()
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()

      // Check if a personal coupon was created in the last 5 days
      const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', fiveDaysAgo)
        .maybeSingle()

      if (existing) return // Already has a recent loyalty coupon

      // Generate unique code
      const code = `LOYAL${user.id.slice(0, 6).toUpperCase()}${Date.now().toString(36).toUpperCase()}`
      const expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

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
        console.error('[useLoyaltyCoupon] failed to insert coupon:', couponError)
        return
      }

      // Insert notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'promo',
        title: '🎉 Loyalty Coupon Unlocked!',
        message: `Use code ${code} for ₹40 off on orders above ₹200. Valid for 10 days!`,
        data: { coupon_code: code },
      })
    }

    run()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps
}
