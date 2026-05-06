import { NextResponse } from 'next/server'
import { type User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/server'
import { getAdminAccessByEmail, type AdminAccess } from '@/lib/knowledge-hub/admin'

type SubmissionAccessRecord = {
  supabaseUserId?: string | null
  supabaseUserEmail?: string | null
}

export type KnowledgeHubSession = {
  user: User
  adminAccess: AdminAccess
}

export async function getKnowledgeHubSession(): Promise<
  | { ok: true; session: KnowledgeHubSession }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !user.email) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    }
  }

  const adminAccess = await getAdminAccessByEmail(user.email.toLowerCase())

  return {
    ok: true,
    session: {
      user,
      adminAccess,
    },
  }
}

export function requireAdmin(adminAccess: AdminAccess) {
  if (!adminAccess.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}

export function canAccessSubmission(
  submission: SubmissionAccessRecord | null | undefined,
  session: KnowledgeHubSession
) {
  if (!submission) return false
  if (session.adminAccess.isAdmin) return true

  const submissionEmail = submission.supabaseUserEmail?.trim().toLowerCase()
  const sessionEmail = session.user.email?.trim().toLowerCase()

  return (
    (submission.supabaseUserId && submission.supabaseUserId === session.user.id) ||
    (submissionEmail && sessionEmail && submissionEmail === sessionEmail)
  )
}
