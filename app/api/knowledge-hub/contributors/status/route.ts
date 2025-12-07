import { NextRequest, NextResponse } from 'next/server'

import { getSanityWriteClient } from '@/sanity/lib/serverClient'
import { sendContributorStatusEmail } from '@/lib/resend/contributor'
import { client } from '@/sanity/lib/client'

const writeClient = getSanityWriteClient()

type StatusPayload = {
  submissionId: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published'
  reviewer?: string
  note?: string
  linkedInsightId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StatusPayload
  const { submissionId, status, reviewer, note, linkedInsightId } = body

    if (!submissionId || !status) {
      return NextResponse.json({ error: 'submissionId and status required' }, { status: 400 })
    }

    const existing = await client.fetch(
      `*[_type == "contributorSubmission" && _id == $id][0]{
        _id,
        title,
        status,
        supabaseUserEmail,
        slug,
        submittedAt
      }`,
      { id: submissionId }
    )

    if (!existing?._id) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const now = new Date().toISOString()

    const patch = writeClient.patch(submissionId)
      .set({ status })
      .setIfMissing({ reviewNotes: [] })

    if (status === 'approved') {
      patch.set({ approvedAt: now })
    }

    if (status === 'published') {
      patch.set({ publishedAt: now })
    }

    if (linkedInsightId) {
      patch.set({
        linkedInsight: {
          _type: 'reference',
          _ref: linkedInsightId,
        },
      })
    }

    if (note) {
      patch.append('reviewNotes', [
        {
          _type: 'note',
          createdAt: now,
          author: reviewer || 'Editor',
          message: note,
        },
      ])
    }

    await patch.commit()

    // Get the linked insight slug for published articles
    let insightSlug: string | undefined
    if (status === 'published' && linkedInsightId) {
      const linkedInsight = await client.fetch(
        `*[_type == "insight" && _id == $id][0]{ "slug": slug.current }`,
        { id: linkedInsightId }
      )
      insightSlug = linkedInsight?.slug
    }

    if (existing.supabaseUserEmail) {
      await sendContributorStatusEmail({
        to: existing.supabaseUserEmail,
        status,
        title: existing.title,
        reviewer,
        note,
        insightSlug,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update contributor submission status', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

