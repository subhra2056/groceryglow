# 🌿 GroceryGlow

**Premium organic grocery delivery app — fresh produce delivered to your door in under 2 hours.**

🔗 **Live Demo:** [https://groceryglow-y75f.vercel.app](https://groceryglow-y75f.vercel.app)

---

## ✨ Features

### Customer
- Browse 500+ products across 8 categories (Fruits, Vegetables, Dairy, Bakery, Meat, Beverages, Snacks, Organic)
- Filter by category, price, organic — sort by price/rating/newest — grid/list view
- Add to cart, apply coupon codes, review order summary
- Checkout with fake payment gateway (COD + Card demo)
- Real-time order status notifications (Supabase Realtime)
- 2-minute cart reminder notification
- Wishlist, product reviews (edit/update), order history
- Account management — edit profile, phone validation, delete account
- Bug report with screenshot upload

### Admin
- Dashboard with revenue, orders, customers, products stats
- Order pipeline breakdown with real-time badges
- Product CRUD with image URLs, stock, pricing, categories
- Order management — update status (Placed → Confirmed → Packed → Shipped → Delivered)
- Customer management — block/unblock users (instant force-logout via Realtime)
- Bug reports management — status tracking, screenshot viewer, delete
- Category and Banner management

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 + DM Sans + DM Serif Display |
| Auth & DB | Supabase (Auth + PostgreSQL + Storage + Realtime) |
| Deployment | Vercel |

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

Fill in your Supabase credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Set up the database
- Go to your Supabase project → SQL Editor
- Run the entire contents of `supabase/schema.sql`

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 👤 Admin Access

After running the schema, create an admin user:
1. Sign up at `/auth/signup` with `admin@groceryglow.com`
2. In Supabase SQL Editor run:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@groceryglow.com';
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Landing page
│   ├── shop/                 ← Shop with filters
│   ├── product/[id]/         ← Product detail + reviews
│   ├── cart/                 ← Cart page
│   ├── checkout/             ← Checkout + fake payment
│   ├── account/              ← Profile, orders, wishlist, notifications
│   ├── auth/                 ← Sign in / Sign up
│   ├── admin/                ← Admin dashboard + management
│   └── api/                  ← API routes (delete account)
├── components/
│   ├── navbar/               ← Navbar, notifications, bug report
│   ├── landing/              ← Hero, categories, offers, etc.
│   ├── shop/                 ← Product cards, filters
│   ├── admin/                ← Admin sidebar
│   └── ui/                   ← Shared UI components
├── contexts/                 ← Auth, Cart, Notification contexts
├── lib/                      ← Supabase clients, utilities
└── types/                    ← TypeScript types
```

---

## 📸 Screenshots

| Landing Page | Shop | Admin Dashboard |
|---|---|---|
| Animated hero with floating produce | Filter by category, price, organic | Revenue stats, order pipeline |

---

## 📄 License

MIT — free to use for personal and commercial projects.

---

Built with ❤️ using Next.js + Supabase
