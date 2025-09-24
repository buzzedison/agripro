require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function main() {
  const email = process.argv[2]
  const firstName = process.argv[3] || 'Lawrence'
  const lastName = process.argv[4] || 'Kafui'

  if (!email) {
    console.error('Usage: node scripts/add-admin.js <email> [firstName] [lastName]')
    process.exit(1)
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing Supabase env vars')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from('admin_users')
    .upsert({
      email,
      first_name: firstName,
      last_name: lastName,
      role: 'admin',
      is_active: true,
    }, { onConflict: 'email', ignoreDuplicates: false })
    .select()

  if (error) {
    console.error('Upsert error:', error)
    process.exit(1)
  }

  console.log('Upserted admin:', data)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
