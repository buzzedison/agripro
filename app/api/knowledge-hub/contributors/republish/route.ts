import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient } from '@/sanity/lib/serverClient'
import { client as readClient } from '@/sanity/lib/client'
import {
  isPortableText,
  markdownToPortableText,
  portableTextToPlainText,
} from '@/lib/knowledge-hub/portableText'
import { getKnowledgeHubSession, requireAdmin } from '@/lib/knowledge-hub/auth'

const writeClient = getSanityWriteClient()

/**
 * Republish/update an existing insight's content from its linked submission
 */
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

    const { insightId } = await request.json()

    if (!insightId) {
      return NextResponse.json({ error: 'insightId is required' }, { status: 400 })
    }

    // Find the submission linked to this insight
    const submission = await readClient.fetch(
      `*[_type == "contributorSubmission" && linkedInsight._ref == $insightId][0]{
        _id,
        content,
        contentSnapshot
      }`,
      { insightId }
    )

    if (!submission) {
      return NextResponse.json({ error: 'No submission found for this insight' }, { status: 404 })
    }

    if (isPortableText(submission.content)) {
      const plainText = portableTextToPlainText(submission.content)
      const hasMarkdownSyntax =
        plainText.includes('## ') ||
        plainText.includes('### ') ||
        plainText.includes('**') ||
        plainText.includes('- ') ||
        plainText.includes('1. ') ||
        plainText.includes('> ') ||
        plainText.includes('![')

      if (!hasMarkdownSyntax) {
        await writeClient.patch(insightId)
          .set({ content: submission.content })
          .commit()

        return NextResponse.json({
          success: true,
          message: 'Insight content updated successfully',
        })
      }
    }

    // Extract plain text from the content
    let plainText = ''
    if (Array.isArray(submission.content) && submission.content.length > 0) {
      plainText = portableTextToPlainText(submission.content)
    } else if (submission.contentSnapshot) {
      plainText = submission.contentSnapshot
    }

    if (!plainText.trim()) {
      return NextResponse.json({ error: 'No content found to republish' }, { status: 400 })
    }

    // Convert markdown to proper Portable Text
    const processedContent = await markdownToPortableText(plainText, writeClient)

    // Update the insight
    await writeClient.patch(insightId)
      .set({ content: processedContent })
      .commit()

    return NextResponse.json({
      success: true,
      message: 'Insight content updated successfully',
    })
  } catch (error) {
    console.error('Failed to republish insight:', error)
    return NextResponse.json({ error: 'Failed to republish insight' }, { status: 500 })
  }
}
