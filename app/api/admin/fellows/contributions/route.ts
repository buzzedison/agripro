import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getContributionCountsByEmail } from '@/lib/fellows'
import { createFellowsAdminClient, isPlatformAdmin } from '@/lib/fellows/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isPlatformAdmin(user.email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createFellowsAdminClient()
  if (!admin) {
    return NextResponse.json({ counts: {} })
  }

  const { data: fellows } = await admin.from('catalyst_fellows').select('email')
  const emails = (fellows || []).map((f) => f.email).filter(Boolean)
  const counts = await getContributionCountsByEmail(emails)

  return NextResponse.json({ counts })
}
