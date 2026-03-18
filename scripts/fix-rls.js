const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const idx = trimmed.indexOf('=')
  if (idx > -1) process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
})

const ADMIN_EMAIL = 'admin@gmail.com'

const statements = [
  // Fix admin function
  `CREATE OR REPLACE FUNCTION is_admin()
   RETURNS boolean AS $$
     SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
   $$ LANGUAGE sql SECURITY DEFINER`,

  // Drop all existing policies
  `DO $$ DECLARE r record;
   BEGIN
     FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
     LOOP
       EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
     END LOOP;
   END $$`,

  // profiles
  `CREATE POLICY "p_sel" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin())`,
  `CREATE POLICY "p_ins" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)`,
  `CREATE POLICY "p_upd" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin())`,
  `CREATE POLICY "p_del" ON profiles FOR DELETE USING (is_admin())`,

  // categories - public read
  `CREATE POLICY "c_sel" ON categories FOR SELECT USING (true)`,
  `CREATE POLICY "c_ins" ON categories FOR INSERT WITH CHECK (is_admin())`,
  `CREATE POLICY "c_upd" ON categories FOR UPDATE USING (is_admin())`,
  `CREATE POLICY "c_del" ON categories FOR DELETE USING (is_admin())`,

  // products - public read
  `CREATE POLICY "pr_sel" ON products FOR SELECT USING (true)`,
  `CREATE POLICY "pr_ins" ON products FOR INSERT WITH CHECK (is_admin())`,
  `CREATE POLICY "pr_upd" ON products FOR UPDATE USING (is_admin())`,
  `CREATE POLICY "pr_del" ON products FOR DELETE USING (is_admin())`,

  // carts
  `CREATE POLICY "ca_all" ON carts FOR ALL USING (auth.uid() = user_id)`,

  // cart_items
  `CREATE POLICY "ci_all" ON cart_items FOR ALL USING (
     EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
   )`,

  // orders
  `CREATE POLICY "o_sel" ON orders FOR SELECT USING (auth.uid() = user_id OR is_admin())`,
  `CREATE POLICY "o_ins" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id)`,
  `CREATE POLICY "o_upd" ON orders FOR UPDATE USING (is_admin())`,

  // order_items
  `CREATE POLICY "oi_sel" ON order_items FOR SELECT USING (
     EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin()))
   )`,
  `CREATE POLICY "oi_ins" ON order_items FOR INSERT WITH CHECK (
     EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
   )`,

  // wishlists
  `CREATE POLICY "w_all" ON wishlists FOR ALL USING (auth.uid() = user_id)`,

  // reviews - public read
  `CREATE POLICY "r_sel" ON reviews FOR SELECT USING (true)`,
  `CREATE POLICY "r_all" ON reviews FOR ALL USING (auth.uid() = user_id)`,

  // banners - public read
  `CREATE POLICY "b_sel" ON banners FOR SELECT USING (true)`,
  `CREATE POLICY "b_ins" ON banners FOR INSERT WITH CHECK (is_admin())`,
  `CREATE POLICY "b_upd" ON banners FOR UPDATE USING (is_admin())`,
  `CREATE POLICY "b_del" ON banners FOR DELETE USING (is_admin())`,

  // notifications
  `CREATE POLICY "n_all" ON notifications FOR ALL USING (auth.uid() = user_id)`,
  `CREATE POLICY "n_sel" ON notifications FOR SELECT USING (is_admin())`,

  // Fix profiles and admin role
  `UPDATE auth.users SET email_confirmed_at = now(), confirmed_at = now() WHERE email_confirmed_at IS NULL`,

  `INSERT INTO profiles (id, email, full_name, role, is_active)
   SELECT id, email,
     CASE WHEN email = '${ADMIN_EMAIL}' THEN 'GroceryGlow Admin' ELSE '' END,
     CASE WHEN email = '${ADMIN_EMAIL}' THEN 'admin' ELSE 'customer' END,
     true
   FROM auth.users
   ON CONFLICT (id) DO UPDATE SET
     role = CASE WHEN auth.users.email = '${ADMIN_EMAIL}' THEN 'admin' ELSE profiles.role END,
     is_active = true`,
]

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()
  console.log('✅ Connected!\n')

  for (let i = 0; i < statements.length; i++) {
    try {
      await client.query(statements[i])
      console.log(`✅ Step ${i + 1}/${statements.length} done`)
    } catch (err) {
      console.error(`❌ Step ${i + 1} failed: ${err.message}`)
    }
  }

  // Verify
  console.log('\n── Policies created ────────────────────────')
  const { rows: policies } = await client.query(`SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename`)
  console.table(policies)

  console.log('\n── Profiles ────────────────────────────────')
  const { rows: profiles } = await client.query(`SELECT email, role FROM profiles`)
  console.table(profiles)

  await client.end()
  console.log('\n✅ Done! Restart dev server and sign in again.')
}

main().catch(console.error)
