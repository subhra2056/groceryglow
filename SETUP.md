# GroceryGlow — Setup & Run Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free at supabase.com)

---

## Step 1 — Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
npm install pg
```

---

## Step 2 — Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click **New Project**
3. Fill in:
   - Project name: `Groceryglow`
   - Database password: (save this, you'll need it)
   - Region: Asia Pacific (or closest to you)
4. Click **Create new project** and wait ~2 minutes

---

## Step 3 — Set Up Environment Variables

1. In the project root, create a file called `.env.local`
2. Add the following (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres.YOUR-PROJECT-ID:YOUR-DB-PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres
```

### Where to find these values:

**NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY:**
- Supabase Dashboard → Click **Connect** button at top
- Select `.env.local` tab
- Copy `NEXT_PUBLIC_SUPABASE_URL` value
- Copy `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` value → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**DATABASE_URL:**
- Supabase Dashboard → Click **Connect** button at top
- Click **Direct** tab
- Copy the **Session pooler** connection string
- Replace `[YOUR-PASSWORD]` with your database password
- Note: special characters in password must be percent-encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `!` → `%21`
  - `$` → `%24`

---

## Step 4 — Create the Database Schema

Run the setup script to create all tables, policies, and seed data:

```bash
node scripts/setup-db.js
```

You should see:
```
✅ Connected!
✅ Schema created successfully!
```

To verify tables were created:
- Supabase Dashboard → **Table Editor** (left sidebar)
- You should see: profiles, categories, products, carts, cart_items, orders, order_items, wishlists, reviews, banners, notifications

---

## Step 5 — Create the Admin User

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@groceryglow.com`
   - Password: `Admin@1234`
4. Click **Create user**
5. Copy the **User UID** shown

6. Go to Supabase Dashboard → **SQL Editor** → New query
7. Run this SQL (replace `PASTE-UID-HERE` with the UID you copied):

```sql
INSERT INTO profiles (id, email, full_name, role, is_active)
VALUES ('PASTE-UID-HERE', 'admin@groceryglow.com', 'GroceryGlow Admin', 'admin', true);
```

---

## Step 6 — Enable Realtime (for order notifications)

1. Supabase Dashboard → **Database** → **Replication**
2. Find the `orders` table and toggle it **ON**

---

## Step 7 — Run the App

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Default Credentials

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@gmail.com          | password123  |
| Customer | (sign up via /auth/signup) | —         |

---

## Admin Panel

Sign in as admin and go to: http://localhost:3000/admin

From the admin panel you can:
- Add/edit/delete **Products** (all product data comes from here — nothing is hardcoded)
- Manage **Categories**
- Manage **Banners**
- View **Orders** and update their status
- View **Customers**

---

## Production Build

```bash
npm run build
npm start
```

---

## Troubleshooting

**"Invalid API key" error**
→ Check `.env.local` — no extra spaces or quotes around values. Restart dev server after editing.

**Admin login redirects to home**
→ Run in Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@groceryglow.com';
```

**Notifications not working**
→ Allow browser notifications when prompted. Check Realtime is enabled for `orders` table (Step 6).

**No products on shop page**
→ Sign in as admin → go to /admin/products → click "Add Product" to add products.

**Database connection timeout**
→ Use the Session pooler URL (not the direct connection URL) in `DATABASE_URL`.
→ Make sure special characters in your password are percent-encoded.

**"String must contain at least 1 character" in Supabase SQL Editor**
→ Use the script approach: `node scripts/setup-db.js` instead.
