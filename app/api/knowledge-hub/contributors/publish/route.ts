import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { getSanityWriteClient } from '@/sanity/lib/serverClient'
import { client as readClient } from '@/sanity/lib/client'
import { sendContributorStatusEmail } from '@/lib/resend/contributor'
import { getAdminAccessByEmail } from '@/lib/knowledge-hub/admin'
import { syncAuthorIdentityByEmail } from '@/lib/knowledge-hub/author'
import { getKnowledgeHubSession, requireAdmin } from '@/lib/knowledge-hub/auth'
import {
  isPortableText,
  markdownToPortableText,
  portableTextToPlainText,
} from '@/lib/knowledge-hub/portableText'

const writeClient = getSanityWriteClient()

type PublishPayload = {
  submissionId: string
  reviewer?: string
  note?: string
  category?: string
}

// Map submission types to insight categories
const categoryMap: Record<string, string> = {
  insight: 'Industry Analysis',
  bestPractice: 'Innovation',
  research: 'Market Trends',
  whitepaper: 'Technology',
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 96)
}

/**
 * Find an existing author by email, or create a new one
 */
async function findOrCreateAuthorByEmail(email: string, name?: string): Promise<string | null> {
  try {
    const syncedAuthor = await syncAuthorIdentityByEmail(email, name)
    return syncedAuthor.canonicalAuthorId
  } catch (error) {
    console.error('Failed to find or create author:', error)
    return null
  }
}

async function syncAdminAuthorRole(authorId: string, email?: string | null, authorType?: string, currentRole?: string | null) {
  if (!email || authorType !== 'author') {
    return
  }

  const adminAccess = await getAdminAccessByEmail(email)

  if (!adminAccess.isAdmin) {
    return
  }

  if (currentRole && currentRole !== 'Contributor') {
    return
  }

  await syncAuthorIdentityByEmail(email)
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getKnowledgeHubSession()
    if (!auth.ok) {
      return auth.response
    }

    const forbidden = requireAdmin(auth.session.adminAccess)
    if (forbidden) {
      return forbidden
    }

    const body = (await request.json()) as PublishPayload
    const { submissionId, note, category } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 })
    }

    // Fetch the full submission
    const submission = await readClient.fetch(
      `*[_type == "contributorSubmission" && _id == $id][0]{
        _id,
        title,
        excerpt,
        content,
        contentSnapshot,
        submissionType,
        topics,
        tags,
        "coverImage": coverImage{
          asset->{_id, _ref}
        },
        supabaseUserEmail,
        supabaseUserId,
        contributorName,
        primaryAuthor->{_id, _type, name, role},
        coAuthors[]->{_id, _type, name, role},
        status,
        linkedInsight
      }`,
      { id: submissionId }
    )

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Check if already published with a linked insight
    if (submission.linkedInsight?._ref) {
      return NextResponse.json({ 
        error: 'This submission is already linked to a published insight',
        linkedInsightId: submission.linkedInsight._ref
      }, { status: 400 })
    }

    const now = new Date().toISOString()
    const slug = createSlug(submission.title)
    const insightId = `insight-${randomUUID()}`

    // Build authors array from primaryAuthor and coAuthors
    const authors: Array<{ _type: 'reference'; _ref: string; _key: string }> = []
    
    // If primaryAuthor exists, use it
    if (submission.primaryAuthor?._id) {
      await syncAdminAuthorRole(
        submission.primaryAuthor._id,
        submission.supabaseUserEmail,
        submission.primaryAuthor._type,
        submission.primaryAuthor.role
      )

      authors.push({
        _type: 'reference',
        _ref: submission.primaryAuthor._id,
        _key: randomUUID(),
      })
    } else if (submission.supabaseUserEmail) {
      // No primaryAuthor linked - try to find or create an author by email
      let authorId = await findOrCreateAuthorByEmail(
        submission.supabaseUserEmail,
        submission.contributorName
      )
      if (authorId) {
        authors.push({
          _type: 'reference',
          _ref: authorId,
          _key: randomUUID(),
        })
        
        // Also update the submission to link to this author for future reference
        await writeClient.patch(submissionId)
          .set({
            primaryAuthor: {
              _type: 'reference',
              _ref: authorId,
            },
          })
          .commit()
      }
    }
    
    if (Array.isArray(submission.coAuthors)) {
      for (const coAuthor of submission.coAuthors) {
        if (coAuthor?._id) {
          authors.push({
            _type: 'reference',
            _ref: coAuthor._id,
            _key: randomUUID(),
          })
        }
      }
    }

    // Process content - convert markdown to Portable Text if needed
    let processedContent: any[] = []
    
    if (isPortableText(submission.content) && submission.content.length > 0) {
      // Content is already in Portable Text format
      // Extract the full text and check if it contains markdown syntax
      const plainText = portableTextToPlainText(submission.content)
      
      // Check if the content contains markdown that wasn't properly parsed
      const hasMarkdownSyntax = 
        plainText.includes('## ') || 
        plainText.includes('### ') ||
        plainText.includes('**') || 
        plainText.includes('- ') ||
        plainText.includes('1. ') ||
        plainText.includes('> ')
      
      if (hasMarkdownSyntax) {
        // Contains markdown syntax, re-parse it properly
        processedContent = await markdownToPortableText(plainText, writeClient)
      } else {
        // Content is already properly formatted
        processedContent = submission.content
      }
    } else if (typeof submission.content === 'string' && submission.content.trim()) {
      // Content is a string, convert it
      processedContent = await markdownToPortableText(submission.content, writeClient)
    } else if (submission.contentSnapshot) {
      // Fall back to contentSnapshot (limited to 1000 chars, but better than nothing)
      processedContent = await markdownToPortableText(submission.contentSnapshot, writeClient)
    }
    
    // Ensure we have at least some content
    if (processedContent.length === 0) {
      return NextResponse.json({ error: 'Submission has no content to publish' }, { status: 400 })
    }

    // Create the insight document
    const insightDoc = {
      _id: insightId,
      _type: 'insight',
      title: submission.title,
      slug: { _type: 'slug', current: slug },
      excerpt: submission.excerpt,
      category: category || categoryMap[submission.submissionType] || 'Industry Analysis',
      publishedAt: now,
      content: processedContent,
      topics: submission.topics || [],
      tags: submission.tags || [],
      ...(submission.coverImage?.asset?._id ? {
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: submission.coverImage.asset._id,
          },
        },
      } : {}),
      ...(authors.length > 0 ? { authors } : {}),
    }

    // Create the insight
    const createdInsight = await writeClient.create(insightDoc)

    // Update the submission status and link to the insight
    const patch = writeClient.patch(submissionId)
      .set({
        status: 'published',
        publishedAt: now,
        linkedInsight: {
          _type: 'reference',
          _ref: createdInsight._id,
        },
      })
      .setIfMissing({ reviewNotes: [] })

    if (note) {
      patch.append('reviewNotes', [
        {
          _type: 'note',
          createdAt: now,
          author: auth.session.user.email || 'Editor',
          message: note,
        },
      ])
    }

    await patch.commit()

    // Send email notification to contributor
    if (submission.supabaseUserEmail) {
      sendContributorStatusEmail({
        to: submission.supabaseUserEmail,
        status: 'published',
        title: submission.title,
        reviewer: auth.session.user.email || 'Editor',
        note,
        insightSlug: slug,
      }).catch((err) => console.error('Failed to send contributor email:', err))
    }

    return NextResponse.json({
      success: true,
      insightId: createdInsight._id,
      insightSlug: slug,
      message: `Article published successfully! View at /knowledgehub/insights/${slug}`,
    })
  } catch (error) {
    console.error('Failed to publish submission:', error)
    return NextResponse.json({ error: 'Failed to publish submission' }, { status: 500 })
  }
}
