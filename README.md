<div align="center">

# 🌿 GroceryGlow

### Premium full-stack grocery delivery application

[![Live Demo](https://img.shields.io/badge/Live%20Demo-groceryglow.vercel.app-4CAF50?style=for-the-badge&logo=vercel)](https://groceryglow.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Lighthouse](https://img.shields.io/badge/Lighthouse-91%2F100-FF6B35?style=for-the-badge&logo=lighthouse)](https://groceryglow.vercel.app)

*Shop fresh. Glow daily.*

</div>

---

## 📌 Overview

GroceryGlow is a production-ready grocery e-commerce application built with **Next.js 15**, **TypeScript**, and **Supabase**. It features a complete customer shopping flow, a full-featured admin dashboard, real-time order tracking, a coupon system, and saved address management — all deployed on Vercel.

> 🔗 **Live:** [https://groceryglow.vercel.app](https://groceryglow.vercel.app)
>
> 👤 **Demo customer:** Sign up with any email
>
> 🔐 **Demo admin:** `admin@groceryglow.com` (see setup below)

---

## ✨ Features

### 🛍️ Customer Experience
- **Smart shop page** — filter by category, price (checkbox-gated), organic tag; sort by price/rating/newest; grid/list toggle
- **Product detail** — image gallery, star ratings, customer reviews with edit/delete
- **Cart** — quantity controls, free delivery threshold, real-time coupon picker
- **Checkout** — saved address selection, add/manage multiple addresses, smart coupon validation with eligibility hints
- **Coupon system** — `NEWBIE100` welcome coupon (₹100 off ₹400+), loyalty coupon auto-issued every 5 days (₹40 off ₹200+), delivered via in-app notifications
- **Real-time order tracking** — Supabase Realtime pushes status updates instantly (Placed → Confirmed → Packed → Shipped → Delivered)
- **Notifications** — bell icon with unread badge, cart reminder after 2 minutes of inactivity
- **Account page** — profile edit, saved addresses, order history, wishlist, coupons tab with ticket-style UI, change password, delete account
- **Bug report** — screenshot upload with status tracking

### ⚙️ Admin Dashboard
- **Overview** — revenue, total orders, customers, products with live pending order badge
- **Products** — full CRUD with image URL, stock, pricing, sale price, category, organic flag
- **Orders** — update order status with one click, view all order items and delivery details
- **Customers** — view all users, block/unblock (triggers instant force-logout via Supabase Realtime)
- **Categories & Banners** — manage site content
- **Bug Reports** — view user-submitted reports with screenshots, update status, delete

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | **Next.js 15** (App Router) | SSR, routing, image optimization |
| Language | **TypeScript** (strict mode) | Type safety across entire codebase |
| Styling | **Tailwind CSS v3** | Utility-first, custom brand palette |
| Fonts | **DM Sans + DM Serif Display** | Premium typography |
| Auth & DB | **Supabase** (Auth + PostgreSQL) | Authentication, database, RLS |
| Realtime | **Supabase Realtime** | Live order updates, instant block |
| Storage | **Supabase Storage** | Bug report screenshots |
| Deployment | **Vercel** | Edge CDN, automatic CI/CD |

---

## 🏗️ Architecture Highlights

- **Multi-role auth** — customer vs admin enforced at 3 layers: middleware, server component, RLS policies
- **Row Level Security** — every Supabase table has RLS policies; users can only access their own data
- **`SECURITY DEFINER` SQL function** — used for account deletion to safely cascade-delete orders without exposing service role key
- **Supabase SSR pattern** — `createBrowserClient` for client components, `createServerClient` with cookie store for server components and API routes
- **Real-time subscriptions** — order status changes and admin blocks use `supabase.channel()` with `postgres_changes`
- **SessionStorage coupon carry** — applied coupon persists from cart → checkout automatically
- **Next.js Image optimization** — WebP/AVIF formats, 1hr minimum cache TTL, `plus.unsplash.com` and `images.unsplash.com` whitelisted

---

## 📊 Performance

Tested on [groceryglow.vercel.app](https://groceryglow.vercel.app) via Chrome Lighthouse:

| Metric | Score |
|--------|-------|
| 🟢 Performance | **91 / 100** |
| 🟡 Accessibility | **89 / 100** |
| 🟢 Best Practices | **100 / 100** |
| 🟢 SEO | **100 / 100** |

| Core Web Vital | Value | Status |
|----------------|-------|--------|
| First Contentful Paint | 1.1s | 🟢 Good |
| Largest Contentful Paint | 1.5s | 🟢 Good |
| Cumulative Layout Shift | 0 | 🟢 Perfect |
| Total Blocking Time | 200ms | 🟡 Acceptable |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/subhra2056/groceryglow.git
cd groceryglow
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.local.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Set up the database
1. Go to your [Supabase project](https://supabase.com) → **SQL Editor**
2. Run the full contents of `supabase/schema.sql`
3. *(Optional)* Run `seed.sql` to populate 40 sample products across 8 categories

### 5. Create the admin account
1. Sign up at `/auth/signup` using any email (e.g. `admin@groceryglow.com`)
2. In Supabase SQL Editor, promote to admin:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@groceryglow.com';
```

### 6. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
grocery app/
├── supabase/
│   └── schema.sql              ← Full DB schema, RLS policies, seed data
├── seed.sql                    ← 40 sample products (Unsplash images)
├── src/
│   ├── app/
│   │   ├── page.tsx            ← Landing page
│   │   ├── shop/               ← Shop with filters & search
│   │   ├── product/[id]/       ← Product detail + reviews
│   │   ├── cart/               ← Cart with coupon picker
│   │   ├── checkout/           ← Address selection + payment
│   │   ├── account/            ← Profile, addresses, orders, wishlist, coupons
│   │   ├── auth/               ← Sign in / Sign up
│   │   ├── admin/              ← Full admin dashboard
│   │   └── api/                ← apply-coupon, delete-account routes
│   ├── components/
│   │   ├── navbar/             ← Navbar, NotificationBell, BugReportModal
│   │   ├── landing/            ← Hero, Categories, BestSelling, Testimonials…
│   │   ├── shop/               ← ProductCard, ProductFilters
│   │   └── ui/                 ← LoadingSpinner, NotificationToast
│   ├── contexts/               ← AuthContext, CartContext, NotificationContext
│   ├── hooks/                  ← useCartReminder, useLoyaltyCoupon, useOrderNotifications
│   ├── lib/
│   │   ├── supabase/           ← client.ts, server.ts
│   │   └── utils.ts            ← formatPrice, formatDate, helpers
│   └── types/
│       └── index.ts            ← Shared TypeScript interfaces
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User accounts with role (customer/admin) |
| `categories` | Product categories |
| `products` | Product listings with stock, pricing, images |
| `carts` + `cart_items` | Per-user cart |
| `orders` + `order_items` | Order history with status pipeline |
| `user_addresses` | Saved delivery addresses |
| `wishlists` | User wishlists |
| `reviews` | Product reviews with ratings |
| `coupons` + `coupon_uses` | Coupon system (personal + global) |
| `notifications` | In-app notifications (order updates, promos) |
| `banners` | Homepage promotional banners |
| `bug_reports` | User-submitted bug reports with screenshots |

---

## 🔐 Security

- RLS enabled on all tables — users can only read/write their own data
- Admin routes protected at 3 levels: Next.js middleware, server component check, database RLS
- `SUPABASE_SERVICE_ROLE_KEY` never exposed to client bundle
- Account deletion uses `SECURITY DEFINER` PostgreSQL function to safely delete cascading data
- Blocked users are force-logged-out in real time via Supabase channel subscription

---

## 📄 License

MIT — free to use for personal and commercial projects.

---

<div align="center">

Built with ❤️ by [Subhra](https://github.com/subhra2056) using Next.js + Supabase

⭐ If you found this useful, give it a star!

</div>
