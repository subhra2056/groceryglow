import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function DELETE() {
  const cookieStore = await cookies()

  // Regular client to verify current user
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

  // Admin client with service role to delete auth user
  const adminClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Call SECURITY DEFINER function — runs as DB owner, bypasses all GRANT/RLS restrictions.
  //    Deletes orders (→ cascades order_items) then profile (→ cascades carts, wishlists, etc.)
  const { error: rpcErr } = await supabase.rpc('delete_user_account', { target_user_id: user.id })
  if (rpcErr) {
    console.error('[delete-account] rpc failed:', rpcErr)
    return NextResponse.json({ error: rpcErr.message }, { status: 500 })
  }

  // 2. Delete auth user (requires service role)
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
  if (deleteError) {
    console.error('[delete-account] auth user delete failed:', deleteError)
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
