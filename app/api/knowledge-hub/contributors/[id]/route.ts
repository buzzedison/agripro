import { NextResponse } from 'next/server'

import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { canAccessSubmission, getKnowledgeHubSession } from '@/lib/knowledge-hub/auth'

// Use fresh client without CDN cache for contributor data
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

type SanityBlock = {
  _type?: string
  children?: Array<{ _type?: string; text?: string }>
}

const query = `
  *[_type == "contributorSubmission" && _id == $id][0]{
    _id,
    title,
    status,
    submissionType,
    excerpt,
    topics,
    tags,
    submissionNotes,
    supabaseUserId,
    supabaseUserEmail,
    contributorName,
    submittedAt,
    approvedAt,
    publishedAt,
    draftWordCount,
    contentSnapshot,
    coverImage,
    reviewNotes[],
    linkedInsight->{ "slug": slug.current, title },
    primaryAuthor->{ _id, _type, name },
    coAuthors[]->{ _id, _type, name },
    content,
    "coverImage": coverImage{
      _type,
      alt,
      caption,
      asset->{ _id, url }
    },
    _createdAt,
    _updatedAt
  }
`

function blocksToPlainText(blocks: SanityBlock[] | undefined): string {
  if (!Array.isArray(blocks)) return ''

  return blocks
    .map(block => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) return ''

      return block.children
        .map(child => (child?._type === 'span' ? child.text ?? '' : ''))
        .join('')
        .trim()
    })
    .filter(Boolean)
    .join('\n\n')
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const auth = await getKnowledgeHubSession()
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Submission id is required' }, { status: 400 })
  }

  try {
    const submission = await client.fetch(query, { id })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (!canAccessSubmission(submission, auth.session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const {
      content: originalContent = [],
      coverImage: originalCoverImage,
      ...rest
    } = submission

    const contentBlocks = originalContent ?? []
    const contentText = blocksToPlainText(contentBlocks)
    const coverImage = originalCoverImage?.asset?._id
      ? {
          assetId: originalCoverImage.asset._id as string,
          url: originalCoverImage.asset.url as string,
          alt: originalCoverImage.alt ?? null,
          caption: originalCoverImage.caption ?? null,
        }
      : null

    return NextResponse.json({
      submission: {
        ...rest,
        contentBlocks,
        contentText,
        coverImage,
      },
    })
  } catch (error) {
    console.error('Failed to fetch submission', error)
    return NextResponse.json({ error: 'Failed to load submission' }, { status: 500 })
  }
}
