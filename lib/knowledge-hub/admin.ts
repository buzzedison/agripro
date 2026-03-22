import { createClient } from '@supabase/supabase-js'

type AdminUserRow = {
  email: string
  role?: string | null
  is_active?: boolean | null
}

export type AdminAccess = {
  isAdmin: boolean
  role?: string
  roleLabel?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function formatRoleLabel(role?: string | null) {
  if (!role) return undefined

  return role
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
    .join(' ')
}

export async function getAdminAccessByEmail(email?: string | null): Promise<AdminAccess> {
  if (!email || !supabaseUrl || !serviceRoleKey) {
    return { isAdmin: false }
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await supabase
      .from('admin_users')
      .select('email, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !data) {
      return { isAdmin: false }
    }

    const adminUser = data as AdminUserRow

    return {
      isAdmin: true,
      role: adminUser.role ?? undefined,
      roleLabel: formatRoleLabel(adminUser.role) ?? 'Admin',
    }
  } catch (error) {
    console.warn('Failed to resolve admin access for knowledge hub submission', error)
    return { isAdmin: false }
  }
}
