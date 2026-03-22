import { NextRequest, NextResponse } from 'next/server'

import { syncAuthorIdentityByEmail } from '@/lib/knowledge-hub/author'
import { getKnowledgeHubSession } from '@/lib/knowledge-hub/auth'

type SyncAuthorPayload = {
  email?: string
  name?: string
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getKnowledgeHubSession()
    if (!auth.ok) {
      return auth.response
    }

    const body = (await request.json()) as SyncAuthorPayload
    const result = await syncAuthorIdentityByEmail(auth.session.user.email!, body.name)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Failed to sync contributor author identity', error)
    return NextResponse.json({ error: 'Failed to sync author identity' }, { status: 500 })
  }
}
