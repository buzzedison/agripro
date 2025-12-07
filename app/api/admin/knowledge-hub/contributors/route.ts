import { NextRequest, NextResponse } from 'next/server'

import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

// Use fresh client without CDN cache for admin data
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

const baseQuery = `
  *[_type == "contributorSubmission"] | order(coalesce(submittedAt, _createdAt) desc) {
    _id,
    title,
    excerpt,
    submissionType,
    status,
    supabaseUserEmail,
    supabaseUserId,
    topics,
    tags,
    draftWordCount,
    submittedAt,
    approvedAt,
    publishedAt,
    _createdAt,
    _updatedAt,
    contentSnapshot,
    "coverImage": coverImage{
      asset->{ _id, url },
      alt,
      caption
    },
    reviewNotes[]{
      createdAt,
      author,
      message
    },
    linkedInsight->{ _id, title, "slug": slug.current }
  }
`

type Submission = {
  _id: string
  title: string
  excerpt?: string
  submissionType: string
  status: SubmissionStatus
  supabaseUserEmail?: string
  supabaseUserId?: string
  topics?: string[]
  tags?: string[]
  draftWordCount?: number
  submittedAt?: string
  approvedAt?: string
  publishedAt?: string
  _createdAt: string
  _updatedAt: string
  contentSnapshot?: string
  coverImage?: {
    asset?: { _id: string; url: string }
    alt?: string
    caption?: string
  } | null
  reviewNotes?: Array<{ createdAt?: string; author?: string; message?: string }>
  linkedInsight?: { _id?: string; title?: string; slug?: string }
}

type SubmissionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published'

const STATUSES: SubmissionStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'published']

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const statusFilter = url.searchParams.get('status')
    const search = url.searchParams.get('q')?.toLowerCase().trim()

    const submissions = (await client.fetch(baseQuery)) as Submission[]

    const statusCounts = submissions.reduce<Record<SubmissionStatus, number>>((acc, submission) => {
      acc[submission.status] = (acc[submission.status] ?? 0) + 1
      return acc
    }, Object.fromEntries(STATUSES.map(status => [status, 0])) as Record<SubmissionStatus, number>)

    const filteredByStatus = statusFilter && statusFilter !== 'all'
      ? submissions.filter((submission) => submission.status === statusFilter)
      : submissions

    const filtered = search
      ? filteredByStatus.filter((submission) => {
          const haystack = [
            submission.title,
            submission.excerpt,
            submission.supabaseUserEmail,
            submission.topics?.join(' ') ?? '',
            submission.tags?.join(' ') ?? '',
            submission.submissionType,
          ]
            .join(' ')
            .toLowerCase()

          return haystack.includes(search)
        })
      : filteredByStatus

    return NextResponse.json({
      submissions: filtered,
      totals: {
        all: submissions.length,
        ...statusCounts,
      },
    })
  } catch (error) {
    console.error('Failed to fetch contributor submissions for admin', error)
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 })
  }
}

