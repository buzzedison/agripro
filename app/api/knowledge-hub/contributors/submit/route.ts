import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { getSanityWriteClient } from '@/sanity/lib/serverClient'
import { client as readClient } from '@/sanity/lib/client'
import { sendAdminNewSubmissionEmail } from '@/lib/resend/contributor'
import { canAccessSubmission, getKnowledgeHubSession } from '@/lib/knowledge-hub/auth'

const writeClient = getSanityWriteClient()

type IncomingBody = {
  submissionId?: string
  title: string
  excerpt: string
  contentBlocks?: any[]
  contentText?: string
  submissionType?: string
  topics?: string[]
  tags?: string[]
  submissionNotes?: string
  supabaseUserId?: string
  supabaseUserEmail?: string
  contributorName?: string
  isFinal?: boolean
  coverImageAssetId?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getKnowledgeHubSession()
    if (!auth.ok) {
      return auth.response
    }

    const { user, adminAccess } = auth.session
    const body = (await request.json()) as IncomingBody

    const {
      submissionId,
      title,
      excerpt,
      contentBlocks,
      contentText,
      submissionType = 'insight',
      topics = [],
      tags = [],
      submissionNotes,
      contributorName,
      isFinal = false,
      coverImageAssetId = null,
    } = body

    if (!title || !excerpt || !(contentBlocks?.length || contentText)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseUserId = user.id
    const supabaseUserEmail = user.email!.trim().toLowerCase()
    const slug = createSlug(title)
    const status = isFinal ? (adminAccess.isAdmin ? 'approved' : 'submitted') : 'draft'
    const now = new Date().toISOString()

    const content = contentBlocks?.length ? contentBlocks : convertPlainTextToPortableText(contentText || '')
    const plainText = contentText || contentBlocks?.map(blockToPlainText).join('\n') || ''
    const contentSnapshot = plainText.slice(0, 1000)
    const draftWordCount = countWords(plainText)

    const primaryAuthorRef = await findContributorReferenceByEmail(supabaseUserEmail)

    const coverImage = coverImageAssetId
      ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: coverImageAssetId,
          },
        }
      : null

    const baseDoc = {
      title,
      slug: { current: slug },
      excerpt,
      submissionType,
      status,
      submissionNotes: submissionNotes || null,
      content,
      contentSnapshot,
      draftWordCount,
      topics,
      tags,
      supabaseUserId,
      supabaseUserEmail,
      contributorName: contributorName || null,
      coverImage,
      submittedAt: status === 'submitted' ? now : null,
      approvedAt: status === 'approved' ? now : null,
      ...(primaryAuthorRef ? { primaryAuthor: primaryAuthorRef } : {}),
    }

    if (!submissionId) {
      const document = {
        _id: `submission-${randomUUID()}`,
        _type: 'contributorSubmission',
        ...baseDoc,
        contentSnapshot,
      }

      const created = await writeClient.create(document)

      // Send admin notification if this is a final submission
      if (isFinal && !adminAccess.isAdmin) {
        sendAdminNewSubmissionEmail({
          contributorEmail: supabaseUserEmail,
          title,
          submissionType,
          excerpt,
          submissionId: created._id,
        }).catch((err) => console.error('Failed to send admin notification:', err))
      }

      return NextResponse.json({
        success: true,
        submissionId: created._id,
        status,
        shouldPublishNow: adminAccess.isAdmin,
      })
    }

    const existing = await readClient.fetch(
      `*[_type == "contributorSubmission" && _id == $id][0]{
        status,
        submittedAt,
        supabaseUserId,
        supabaseUserEmail
      }`,
      { id: submissionId }
    )

    if (!existing) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (!canAccessSubmission(existing, auth.session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const patch = writeClient.patch(submissionId).set({
      ...baseDoc,
      contentSnapshot,
      draftWordCount,
      submittedAt: status === 'submitted' ? existing.submittedAt || now : existing.submittedAt || null,
      approvedAt: status === 'approved' ? now : null,
    })

    await patch.commit()

    // Send admin notification if this is a final submission (and wasn't already submitted)
    if (isFinal && !adminAccess.isAdmin && existing.status !== 'submitted') {
      sendAdminNewSubmissionEmail({
        contributorEmail: supabaseUserEmail,
        title,
        submissionType,
        excerpt,
        submissionId,
      }).catch((err) => console.error('Failed to send admin notification:', err))
    }

    return NextResponse.json({
      success: true,
      submissionId,
      status,
      shouldPublishNow: adminAccess.isAdmin,
    })
  } catch (error) {
    console.error('Contributor submission error:', error)
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }
}

async function findContributorReferenceByEmail(email: string) {
  try {
    const result = await readClient.fetch(
      `*[_type in ["author", "expert"] && contact.email == $email][0]{ _id, _type }`,
      { email }
    )

    if (!result?._id) return null

    return {
      _type: 'reference' as const,
      _ref: result._id as string,
    }
  } catch (error) {
    console.warn('Failed to resolve contributor reference', error)
    return null
  }
}

function convertPlainTextToPortableText(text: string) {
  return text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          marks: [],
          text: paragraph,
        },
      ],
    }))
}

function blockToPlainText(block: any): string {
  if (block?._type !== 'block' || !Array.isArray(block.children)) {
    return ''
  }

  return block.children
    .map((child: any) => (child?._type === 'span' ? child.text : ''))
    .join('')
}

function countWords(text: string) {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96)
}
