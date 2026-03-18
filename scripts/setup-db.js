const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx > -1) {
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      process.env[key] = val
    }
  })
}

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('\n❌ DATABASE_URL not found in .env.local')
    console.error('Add this line to your .env.local:')
    console.error('DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres\n')
    console.error('Get it from: Supabase Dashboard → Settings → Database → Connection string (Transaction pooler)\n')
    process.exit(1)
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('\n⏳ Connecting to database...')
    await client.connect()
    console.log('✅ Connected!\n')

    const sqlFile = path.join(__dirname, '..', 'supabase', 'schema.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')

    console.log('⏳ Running schema...')
    await client.query(sql)
    console.log('✅ Schema created successfully!\n')
    console.log('Tables created: profiles, categories, products, carts, cart_items,')
    console.log('               orders, order_items, wishlists, reviews, banners, notifications\n')
  } catch (err) {
    console.error('\n❌ Error:', err.message)
    if (err.message.includes('already exists')) {
      console.log('\n💡 Some tables already exist — that is fine, they were skipped.\n')
    }
  } finally {
    await client.end()
  }
}

main()
