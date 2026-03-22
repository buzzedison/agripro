import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'
import { getKnowledgeHubSession, requireAdmin } from '@/lib/knowledge-hub/auth'

export async function GET() {
  try {
    const auth = await getKnowledgeHubSession()
    if (!auth.ok) {
      return auth.response
    }

    const forbidden = requireAdmin(auth.session.adminAccess)
    if (forbidden) {
      return forbidden
    }

    const count = await client.fetch(
      `count(*[_type == "contributorSubmission" && status == "submitted"])`
    )

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to fetch pending submissions count:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
