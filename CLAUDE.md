# CLAUDE.md — GroceryGlow Project Brain

This file is my persistent memory for the GroceryGlow grocery app project.
Every bug found and fixed must be logged here.

---

## Project Overview

**Name:** GroceryGlow
**Type:** Full-stack grocery application
**Purpose:** Premium grocery shopping app with customer shopping flows and a single-admin management system.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict, entire codebase) |
| Styling | Tailwind CSS v3 with custom brand palette |
| Auth/DB | Supabase (Auth + PostgreSQL + Storage) |
| Supabase SSR | @supabase/ssr v0.5+ |
| Icons | lucide-react |
| State | React Context (Auth, Cart) |

---

## Brand Colors (Tailwind custom config)

```
forest-green: #1F6B4F   ← primary dark
leaf-green:   #4CAF50   ← primary accent
cream:        #FFF8EE   ← background
charcoal:     #1E1E1E   ← text
sunset-orange:#FF8A3D   ← CTA / badges
```

---

## Admin Account (Seed Data)

```
Email:  admin@groceryglow.com
ID:     00000000-0000-0000-0000-000000000001
Role:   admin
```

- Admin is seeded via `supabase/schema.sql`
- No public admin signup route exists
- Admin role is stored in `profiles.role` column
- Enforced via middleware + server-side checks + RLS

---

## File Structure

```
grocery app/
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local.example
├── middleware.ts
├── supabase/
│   └── schema.sql
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx                  ← Landing page
    │   ├── shop/page.tsx
    │   ├── product/[id]/page.tsx
    │   ├── cart/page.tsx
    │   ├── checkout/page.tsx
    │   ├── account/page.tsx
    │   ├── auth/signin/page.tsx
    │   ├── auth/signup/page.tsx
    │   └── admin/
    │       ├── layout.tsx
    │       ├── page.tsx
    │       ├── products/page.tsx
    │       └── orders/page.tsx
    ├── components/
    │   ├── navbar/Navbar.tsx
    │   ├── landing/
    │   │   ├── Hero.tsx
    │   │   ├── FeaturedCategories.tsx
    │   │   ├── BestSelling.tsx
    │   │   ├── FreshOffers.tsx
    │   │   ├── HowItWorks.tsx
    │   │   ├── WhyChooseUs.tsx
    │   │   ├── Testimonials.tsx
    │   │   ├── Newsletter.tsx
    │   │   └── Footer.tsx
    │   ├── shop/
    │   │   ├── ProductCard.tsx
    │   │   └── ProductFilters.tsx
    │   ├── admin/
    │   │   └── AdminSidebar.tsx
    │   └── ui/
    │       └── LoadingSpinner.tsx
    ├── contexts/
    │   ├── AuthContext.tsx
    │   └── CartContext.tsx
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   └── server.ts
    │   └── utils.ts
    └── types/
        └── index.ts
```

---

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    ← server-side only, never expose to client
```

---

## Key Architecture Decisions

1. **Server vs Client Components**
   - Landing page sections: Server Components (static HTML)
   - Interactive UI (cart, filters, forms): Client Components (`'use client'`)
   - Admin CRUD pages: Client Components

2. **Auth Flow**
   - `AuthContext` wraps the entire app, listens to `onAuthStateChange`
   - `profile` row (with `role`) fetched on auth state change
   - `isAdmin` computed from `profile.role === 'admin'`

3. **Cart Flow**
   - Cart only available to logged-in customers
   - Cart stored in Supabase `carts` + `cart_items` tables
   - `CartContext` manages local state + syncs with Supabase

4. **Admin Protection (layered)**
   - Middleware: redirects unauthenticated users accessing `/admin/*`
   - Admin layout server component: reads profile, redirects non-admins
   - RLS: only admin can write products/categories/banners

5. **Next.js 15 Async APIs**
   - `params` in dynamic routes must be awaited: `const { id } = await params`
   - `cookies()` from `next/headers` must be awaited: `const cookieStore = await cookies()`

6. **Supabase SSR Pattern**
   - Browser client: `createBrowserClient` (for Client Components)
   - Server client: `createServerClient` with cookie store (for Server Components, Route Handlers)

---

## Common Pitfalls to Avoid

- NEVER import `createBrowserClient` in a Server Component
- NEVER use `useRouter` in a Server Component
- NEVER expose `SUPABASE_SERVICE_ROLE_KEY` to the client bundle
- Always handle `null` for product images array (use `images?.[0] ?? ''`)
- Cart subtotal must be recalculated on every item change
- Admin route middleware must check profile role from DB, not just cookie
- `order_status` enum values must match schema exactly

---

## Supabase RLS Summary

| Table | Public Read | Customer Write | Admin Write |
|-------|------------|----------------|-------------|
| profiles | ❌ | own row only | all rows |
| categories | ✅ | ❌ | ✅ |
| products | ✅ | ❌ | ✅ |
| banners | ✅ | ❌ | ✅ |
| carts | ❌ | own row only | ❌ |
| cart_items | ❌ | own cart only | ❌ |
| orders | ❌ | own rows | all rows (status update) |
| order_items | ❌ | own orders | all rows |
| wishlists | ❌ | own rows | ❌ |
| reviews | ✅ | own rows | ❌ |

---

## Notification System (User-Requested Feature)

### Two notification types:
1. **Cart Reminder** — if cart has items for >2 minutes without checkout, fire a browser notification + in-app toast
2. **Order Status Updates** — Supabase Realtime subscription on `orders` table; when admin updates `order_status`, users get an in-app notification

### Implementation:
- `src/contexts/NotificationContext.tsx` — manages notification list, unread count, mark-as-read
- `src/hooks/useCartReminder.ts` — setTimeout(2 min) watching cart state
- `src/hooks/useOrderNotifications.ts` — Supabase `supabase.channel()` subscription
- `src/components/navbar/NotificationBell.tsx` — bell icon with badge in Navbar
- `notifications` table in Supabase for persistence
- Payment gateway is **intentionally fake** — COD and "Card" both show a success screen

### DB table: notifications
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text CHECK (type IN ('cart_reminder','order_update','promo')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  data jsonb,
  created_at timestamptz DEFAULT now()
);
```

## Bugs Found & Fixed

*(This section is updated as bugs are discovered and resolved)*

| # | File | Bug Description | Fix Applied |
|---|------|----------------|-------------|
| 1 | middleware.ts + server.ts | `cookiesToSet` parameter had implicit `any` type in TypeScript strict mode | Added explicit type annotation using `CookieOptions` from `@supabase/ssr` |
| 2 | client.ts | Supabase `createBrowserClient` throws at build time when env vars are missing | Added placeholder fallbacks in createClient so `next build` succeeds without real `.env.local` |
| 3 | Dynamic pages (account, shop, etc.) | Next.js tries to statically prerender client pages during build, triggering Supabase init | Added `export const dynamic = 'force-dynamic'` to all pages that depend on auth/Supabase |
| 4 | checkout/page.tsx | Order success card showed `₹0.00` subtotal after checkout because it read totals from cleared cart state | Stored the placed order totals in local success-state and rendered the summary from that snapshot |
| 5 | hooks/useLoyaltyCoupon.ts + CouponsTab.tsx | Loyalty coupons were generated on the wrong cadence and stayed valid too long | Changed loyalty issuance to once every 2 days, expiry to 4 days, and updated the related coupon copy |
| 6 | account/page.tsx | Coupons tab only showed user-specific coupons and hid global coupons like `NEWBIE100` | Updated coupon loading to include global coupons and derive per-user used state from `coupon_uses` |
| 7 | lib/supabase/client.ts + AuthContext.tsx | Invalid Supabase refresh tokens could keep surfacing as client auth errors during bootstrap | Reused a singleton browser client and cleared invalid local sessions during auth initialization and refresh handling |

---

## Notes on Design Quality

- Navbar uses glassmorphism: `backdrop-blur-md bg-white/90 shadow-sm`
- Hero section uses deep green gradient with large SVG/emoji produce visuals
- All cards use `hover:-translate-y-1 transition-transform` for depth
- CTA buttons always use `sunset-orange` (#FF8A3D) fill
- Cream (#FFF8EE) used as page background throughout
- Forest green (#1F6B4F) for headings, nav, admin sidebar
