import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeHubSession } from '@/lib/knowledge-hub/auth'
import { getAdminAccessByEmail } from '@/lib/knowledge-hub/admin'

export async function GET(request: NextRequest) {
  try {
    const auth = await getKnowledgeHubSession()
    if (!auth.ok) {
      return auth.response
    }

    const currentUserEmail = auth.session.user.email!.trim().toLowerCase()
    const { searchParams } = new URL(request.url)
    const requestedEmail = searchParams.get('email')?.trim().toLowerCase()
    const targetEmail = requestedEmail || currentUserEmail

    if (targetEmail !== currentUserEmail && !auth.session.adminAccess.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const adminAccess = await getAdminAccessByEmail(targetEmail)

    return NextResponse.json({
      isAdmin: adminAccess.isAdmin,
      adminData: adminAccess.isAdmin
        ? {
            email: targetEmail,
            role: adminAccess.role ?? null,
            roleLabel: adminAccess.roleLabel ?? null,
          }
        : null,
      email: targetEmail
    })
  } catch (error) {
    console.error('Admin status check error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
