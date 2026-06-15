import { createClient } from '@supabase/supabase-js'
import { getAdminAccessByEmail } from '@/lib/knowledge-hub/admin'

// Single source of truth for "is this user a platform admin" in the fellows
// feature. Any active row in admin_users qualifies; the hardcoded email is the
// same bootstrap fallback the middleware uses for when admin_users is empty.
export async function isPlatformAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false
  if (email.toLowerCase() === 'edison@agriprohub.com') return true
  const access = await getAdminAccessByEmail(email)
  return access.isAdmin
}

// Cookie-free anon client for the public fellows pages — keeps them cacheable
// (the cookie-based server client would force dynamic rendering).
export function createFellowsPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

// Service-role client for public fellow pages: lets us look up a fellow's email
// (needed to match Knowledge Hub contributions) without exposing email through
// the public directory view.
export function createFellowsAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function getFellowEmailBySlug(slug: string): Promise<string | null> {
  const admin = createFellowsAdminClient()
  if (!admin) return null
  const { data } = await admin
    .from('catalyst_fellows')
    .select('email')
    .eq('slug', slug)
    .maybeSingle()
  return data?.email ?? null
}
