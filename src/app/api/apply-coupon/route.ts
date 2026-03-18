import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const code = body.code?.trim().toUpperCase()
  if (!code) {
    return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
  }

  const now = new Date().toISOString()

  // 1. Check personal coupons first
  const { data: personalCoupon } = await supabase
    .from('coupons')
    .select('id, code, discount_amount, min_order_amount')
    .eq('user_id', user.id)
    .eq('code', code)
    .eq('is_used', false)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .maybeSingle()

  if (personalCoupon) {
    return NextResponse.json({
      valid: true,
      coupon_id: personalCoupon.id,
      type: 'personal' as const,
      discount_amount: personalCoupon.discount_amount,
      min_order_amount: personalCoupon.min_order_amount,
      code: personalCoupon.code,
    })
  }

  // 2. Check global coupons
  const { data: globalCoupon } = await supabase
    .from('coupons')
    .select('id, code, discount_amount, min_order_amount')
    .is('user_id', null)
    .eq('code', code)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .maybeSingle()

  if (!globalCoupon) {
    return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
  }

  // Check if this user has already used this global coupon
  const { data: existingUse } = await supabase
    .from('coupon_uses')
    .select('id')
    .eq('coupon_id', globalCoupon.id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingUse) {
    return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 })
  }

  return NextResponse.json({
    valid: true,
    coupon_id: globalCoupon.id,
    type: 'global' as const,
    discount_amount: globalCoupon.discount_amount,
    min_order_amount: globalCoupon.min_order_amount,
    code: globalCoupon.code,
  })
}
