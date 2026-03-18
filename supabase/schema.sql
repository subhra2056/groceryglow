-- ================================================================
-- GroceryGlow — Complete Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ================================================================

-- ── Extensions ──────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Bug Reports ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bug_reports (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_email     text,
  description    text NOT NULL,
  screenshot_url text,
  status         text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert bug reports"  ON bug_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can read all bug reports" ON bug_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update bug reports"  ON bug_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

GRANT INSERT ON bug_reports TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON bug_reports TO authenticated;

CREATE POLICY "Admins can delete bug reports" ON bug_reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ── Storage: bug-screenshots bucket ──────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('bug-screenshots', 'bug-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- ── Profiles ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  full_name     text,
  email         text UNIQUE NOT NULL,
  phone         text UNIQUE CHECK (phone ~ '^\d{7,15}$'),
  photo_url     text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

-- ── Categories ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  image       text,
  description text,
  is_featured boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Products ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  category_id       uuid REFERENCES categories(id) ON DELETE SET NULL,
  description       text,
  short_description text,
  price             numeric(10,2) NOT NULL,
  discount_price    numeric(10,2),
  currency          text NOT NULL DEFAULT 'USD',
  stock             integer NOT NULL DEFAULT 0,
  images            text[],
  is_featured       boolean NOT NULL DEFAULT false,
  is_organic        boolean NOT NULL DEFAULT false,
  rating_average    numeric(3,2) NOT NULL DEFAULT 0,
  review_count      integer NOT NULL DEFAULT 0,
  tags              text[],
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── Carts ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  subtotal   numeric(10,2) NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Cart Items ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    uuid REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity   integer NOT NULL CHECK (quantity > 0),
  price      numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Orders ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES profiles(id),
  order_number            text UNIQUE NOT NULL,
  subtotal                numeric(10,2) NOT NULL,
  delivery_fee            numeric(10,2) NOT NULL DEFAULT 0,
  discount                numeric(10,2) NOT NULL DEFAULT 0,
  total                   numeric(10,2) NOT NULL,
  payment_method          text NOT NULL,
  payment_status          text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  order_status            text NOT NULL DEFAULT 'placed'  CHECK (order_status  IN ('placed','confirmed','packed','shipped','delivered','cancelled')),
  delivery_full_name      text NOT NULL,
  delivery_phone          text NOT NULL,
  delivery_address_line_1 text NOT NULL,
  delivery_address_line_2 text,
  delivery_city           text NOT NULL,
  delivery_state          text NOT NULL,
  delivery_postal_code    text NOT NULL,
  delivery_country        text NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ── Order Items ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name       text NOT NULL,
  price      numeric(10,2) NOT NULL,
  quantity   integer NOT NULL,
  image      text
);

-- ── Wishlists ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ── Reviews ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_name  text NOT NULL,
  rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- ── Banners ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  subtitle   text,
  image      text,
  cta_text   text,
  cta_link   text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Notifications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN ('cart_reminder','order_update','promo')),
  title      text NOT NULL,
  message    text NOT NULL,
  is_read    boolean NOT NULL DEFAULT false,
  data       jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ================================================================
-- Functions & Triggers
-- ================================================================

-- Deletes a user's data safely — SECURITY DEFINER runs as DB owner, bypassing GRANT restrictions.
-- Called from /api/delete-account route. Deletes orders (→ order_items) then profile (→ cascades).
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM orders  WHERE user_id = target_user_id;
  DELETE FROM profiles WHERE id    = target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION delete_user_account TO authenticated;

CREATE OR REPLACE FUNCTION prevent_multiple_admins()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    IF EXISTS (SELECT 1 FROM profiles WHERE role = 'admin' AND id != NEW.id) THEN
      RAISE EXCEPTION 'Only one admin account is allowed.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_admin ON profiles;
CREATE TRIGGER enforce_single_admin
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_multiple_admins();

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON products;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_orders ON orders;
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION sync_product_rating()
RETURNS TRIGGER AS $$
DECLARE pid uuid;
BEGIN
  pid := COALESCE(OLD.product_id, NEW.product_id);
  UPDATE products SET
    rating_average = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM reviews WHERE product_id = pid), 0),
    review_count   = (SELECT COUNT(*) FROM reviews WHERE product_id = pid)
  WHERE id = pid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_rating ON reviews;
CREATE TRIGGER update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION sync_product_rating();

-- ================================================================
-- Row Level Security
-- ================================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing policies before recreating (safe re-run)
DO $$ DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (is_admin());

-- categories
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (is_admin());
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (is_admin());

-- products
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "products_update" ON products FOR UPDATE USING (is_admin());
CREATE POLICY "products_delete" ON products FOR DELETE USING (is_admin());

-- carts
CREATE POLICY "carts_all" ON carts FOR ALL USING (auth.uid() = user_id);

-- cart_items
CREATE POLICY "cart_items_all" ON cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- orders
CREATE POLICY "orders_select" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (is_admin());

-- order_items
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- wishlists
CREATE POLICY "wishlists_all" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- reviews
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_all"    ON reviews FOR ALL   USING (auth.uid() = user_id);

-- banners
CREATE POLICY "banners_select" ON banners FOR SELECT USING (true);
CREATE POLICY "banners_insert" ON banners FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "banners_update" ON banners FOR UPDATE USING (is_admin());
CREATE POLICY "banners_delete" ON banners FOR DELETE USING (is_admin());

-- notifications
CREATE POLICY "notifications_all"    ON notifications FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (is_admin());

-- ================================================================
-- Role Grants (required for PostgREST / anon + authenticated access)
-- ================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public read (unauthenticated visitors can browse)
GRANT SELECT ON categories  TO anon, authenticated;
GRANT SELECT ON products    TO anon, authenticated;
GRANT SELECT ON banners     TO anon, authenticated;
GRANT SELECT ON reviews     TO anon, authenticated;

-- Authenticated customers
GRANT SELECT, INSERT, UPDATE ON profiles       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON carts        TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items   TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders       TO authenticated;
GRANT SELECT, INSERT ON order_items  TO authenticated;
GRANT SELECT, INSERT, DELETE ON wishlists    TO authenticated;
GRANT INSERT ON reviews      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON wishlists    TO authenticated;

-- Admin write access (already gated by RLS is_admin())
GRANT INSERT, UPDATE, DELETE ON categories  TO authenticated;
GRANT INSERT, UPDATE, DELETE ON products    TO authenticated;
GRANT INSERT, UPDATE, DELETE ON banners     TO authenticated;
GRANT UPDATE ON orders TO authenticated;
GRANT DELETE ON reviews TO authenticated;

-- ================================================================
-- Realtime (ignore error if already added)
-- ================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- ================================================================
-- Seed Data
-- ================================================================

INSERT INTO categories (name, slug, description, is_featured) VALUES
  ('Fresh Fruits',   'fresh-fruits', 'Seasonal organic fruits, hand-picked daily',      true),
  ('Vegetables',     'vegetables',   'Farm-fresh vegetables delivered same day',         true),
  ('Dairy & Eggs',   'dairy',        'Premium dairy products from local farms',          true),
  ('Bakery',         'bakery',       'Freshly baked breads, pastries and more',          false),
  ('Meat & Seafood', 'meat-seafood', 'Premium cuts and fresh-caught seafood',            false),
  ('Beverages',      'beverages',    'Juices, smoothies, water and healthy drinks',      false),
  ('Snacks',         'snacks',       'Healthy snacks for the whole family',              false),
  ('Organic',        'organic',      'Certified organic products across all categories', false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Bananas','organic-bananas',(SELECT id FROM categories WHERE slug='fresh-fruits'),'Sweet and ripe organic bananas',2.99,2.49,120,ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80'],true,true,ARRAY['offer','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-bananas');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Fresh Tomatoes','fresh-tomatoes',(SELECT id FROM categories WHERE slug='vegetables'),'Juicy vine-ripened tomatoes',1.99,1.79,200,ARRAY['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'],true,false,ARRAY['offer','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='fresh-tomatoes');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Whole Milk','organic-whole-milk',(SELECT id FROM categories WHERE slug='dairy'),'Full-fat organic milk from grass-fed cows',4.49,NULL,80,ARRAY['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'],true,true,ARRAY['bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-whole-milk');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Sourdough Bread','sourdough-bread',(SELECT id FROM categories WHERE slug='bakery'),'Artisan sourdough baked fresh daily',6.99,NULL,40,ARRAY['https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&q=80'],true,false,ARRAY['new']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='sourdough-bread');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Organic Broccoli','organic-broccoli',(SELECT id FROM categories WHERE slug='vegetables'),'Crisp organic broccoli crowns',2.49,1.99,150,ARRAY['https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80'],true,true,ARRAY['offer']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='organic-broccoli');

INSERT INTO products (name, slug, category_id, short_description, price, discount_price, stock, images, is_featured, is_organic, tags)
SELECT 'Fresh Strawberries','fresh-strawberries',(SELECT id FROM categories WHERE slug='fresh-fruits'),'Sweet California strawberries',3.99,3.49,90,ARRAY['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80'],true,false,ARRAY['seasonal','bestseller']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug='fresh-strawberries');

-- Patch images on existing rows (idempotent)
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80'] WHERE slug = 'organic-bananas'   AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80'] WHERE slug = 'fresh-tomatoes'     AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80'] WHERE slug = 'organic-whole-milk' AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=400&q=80'] WHERE slug = 'sourdough-bread'   AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80'] WHERE slug = 'organic-broccoli'  AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80'] WHERE slug = 'fresh-strawberries' AND (images IS NULL OR images = '{}');

-- ── Stock Deduction Trigger ──────────────────────────────────────
-- Automatically deducts product stock when an order is placed
CREATE OR REPLACE FUNCTION deduct_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = GREATEST(0, stock - NEW.quantity)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_deduct_stock_on_order
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION deduct_product_stock();

-- ================================================================
-- Coupons (run this block separately if schema already applied)
-- ================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  discount_amount numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2) NOT NULL DEFAULT 0,
  is_used boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS coupons_global_code_idx ON coupons (code) WHERE user_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS coupons_user_code_idx ON coupons (code, user_id) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS coupon_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_coupons" ON coupons FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "users_update_own_coupons" ON coupons FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "service_insert_coupons" ON coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "users_read_own_uses" ON coupon_uses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_insert_uses" ON coupon_uses FOR INSERT WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON coupons TO authenticated;
GRANT SELECT, INSERT ON coupon_uses TO authenticated;

-- Seed NEWBIE100 global coupon
INSERT INTO coupons (code, user_id, discount_amount, min_order_amount, is_active)
VALUES ('NEWBIE100', NULL, 100.00, 400.00, true)
ON CONFLICT DO NOTHING;

-- ── User Addresses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL DEFAULT 'Home',
  full_name text NOT NULL,
  phone text,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own addresses" ON user_addresses
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
GRANT SELECT, INSERT, UPDATE, DELETE ON user_addresses TO authenticated;
