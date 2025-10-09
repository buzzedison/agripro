import { NextRequest, NextResponse } from 'next/server'

import { client } from '@/sanity/lib/client'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const submissions = await client.fetch(
      `*[_type == "contributorSubmission" && supabaseUserEmail == $email] |
       order(coalesce(submittedAt, _createdAt) desc) {
        _id,
        title,
        status,
        submissionType,
        excerpt,
        topics,
        tags,
        submissionNotes,
        contentSnapshot,
        draftWordCount,
        submittedAt,
        approvedAt,
        publishedAt,
        reviewNotes,
        linkedInsight->{ "slug": slug.current }
      }`,
      { email }
    )

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Failed to list contributor submissions', error)
    return NextResponse.json({ error: 'Failed to list submissions' }, { status: 500 })
  }
}

