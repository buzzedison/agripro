import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { getSanityWriteClient } from '@/sanity/lib/serverClient'
import { client as readClient } from '@/sanity/lib/client'
import { sendContributorStatusEmail } from '@/lib/resend/contributor'

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
 * Convert markdown text to Sanity Portable Text blocks
 */
function markdownToPortableText(markdown: string): any[] {
  const blocks: any[] = []
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) {
      i++
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      blocks.push(createBlock(line.slice(4), 'h3'))
      i++
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push(createBlock(line.slice(3), 'h2'))
      i++
      continue
    }
    if (line.startsWith('# ')) {
      blocks.push(createBlock(line.slice(2), 'h1'))
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2))
        i++
      }
      blocks.push(createBlock(quoteLines.join(' '), 'blockquote'))
      continue
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      const listItems: any[] = []
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        listItems.push({
          _type: 'block',
          _key: randomUUID(),
          style: 'normal',
          listItem: 'bullet',
          level: 1,
          markDefs: [],
          children: parseInlineMarks(lines[i].replace(/^[-*]\s/, '')),
        })
        i++
      }
      blocks.push(...listItems)
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      const listItems: any[] = []
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push({
          _type: 'block',
          _key: randomUUID(),
          style: 'normal',
          listItem: 'number',
          level: 1,
          markDefs: [],
          children: parseInlineMarks(lines[i].replace(/^\d+\.\s/, '')),
        })
        i++
      }
      blocks.push(...listItems)
      continue
    }

    // Image (markdown syntax)
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imageMatch) {
      // Skip images for now - they need special handling with Sanity assets
      i++
      continue
    }

    // Regular paragraph - collect consecutive non-empty lines
    const paragraphLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].match(/^[-*]\s/) &&
      !lines[i].match(/^\d+\.\s/) &&
      !lines[i].match(/^!\[/)
    ) {
      paragraphLines.push(lines[i])
      i++
    }
    if (paragraphLines.length > 0) {
      blocks.push(createBlock(paragraphLines.join(' '), 'normal'))
    }
  }

  return blocks
}

function createBlock(text: string, style: string): any {
  return {
    _type: 'block',
    _key: randomUUID(),
    style,
    markDefs: [],
    children: parseInlineMarks(text),
  }
}

/**
 * Parse inline markdown marks (bold, italic, links) into Portable Text children
 */
function parseInlineMarks(text: string): any[] {
  const children: any[] = []
  let remaining = text

  // Simple regex-based parsing for bold, italic, and links
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, mark: 'strong' },
    { regex: /\*(.+?)\*/g, mark: 'em' },
    { regex: /_(.+?)_/g, mark: 'em' },
  ]

  // For simplicity, we'll do a single pass that handles bold and italic
  // This is a simplified version - a full parser would be more complex
  let lastIndex = 0
  const parts: Array<{ text: string; marks: string[] }> = []

  // Find all bold sections
  const boldRegex = /\*\*(.+?)\*\*/g
  let match
  let processedText = text

  // Replace bold with placeholder and track positions
  const boldMatches: Array<{ start: number; end: number; text: string }> = []
  while ((match = boldRegex.exec(text)) !== null) {
    boldMatches.push({ start: match.index, end: match.index + match[0].length, text: match[1] })
  }

  // Replace italic with placeholder
  const italicRegex = /\*([^*]+)\*/g
  const italicMatches: Array<{ start: number; end: number; text: string }> = []
  
  // Simple approach: split by bold markers first
  const segments = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  
  for (const segment of segments) {
    if (!segment) continue
    
    if (segment.startsWith('**') && segment.endsWith('**')) {
      // Bold text
      children.push({
        _type: 'span',
        _key: randomUUID(),
        marks: ['strong'],
        text: segment.slice(2, -2),
      })
    } else if (segment.startsWith('*') && segment.endsWith('*') && !segment.startsWith('**')) {
      // Italic text
      children.push({
        _type: 'span',
        _key: randomUUID(),
        marks: ['em'],
        text: segment.slice(1, -1),
      })
    } else {
      // Plain text
      children.push({
        _type: 'span',
        _key: randomUUID(),
        marks: [],
        text: segment,
      })
    }
  }

  // If no children were created, add the original text
  if (children.length === 0) {
    children.push({
      _type: 'span',
      _key: randomUUID(),
      marks: [],
      text: text,
    })
  }

  return children
}

/**
 * Check if content is already in Portable Text format
 */
function isPortableText(content: any): boolean {
  return Array.isArray(content) && content.length > 0 && content[0]?._type === 'block'
}

/**
 * Find an existing author by email, or create a new one
 */
async function findOrCreateAuthorByEmail(email: string, name?: string): Promise<string | null> {
  try {
    // First, try to find an existing author or expert with this email
    const existing = await readClient.fetch(
      `*[_type in ["author", "expert"] && contact.email == $email][0]{ _id }`,
      { email }
    )
    
    if (existing?._id) {
      return existing._id
    }
    
    // No existing author found - create a new one
    const authorId = `author-${randomUUID()}`
    const authorName = name || email.split('@')[0] // Use name or derive from email
    const authorSlug = authorName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 96)
    
    const newAuthor = await writeClient.create({
      _id: authorId,
      _type: 'author',
      name: authorName,
      slug: { _type: 'slug', current: authorSlug },
      role: 'Contributor',
      contact: {
        email: email,
      },
    })
    
    return newAuthor._id
  } catch (error) {
    console.error('Failed to find or create author:', error)
    return null
  }
}

/**
 * Extract plain text from Portable Text blocks
 */
function portableTextToPlainText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''
  
  return blocks
    .map(block => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) return ''
      return block.children
        .map((child: any) => child?.text ?? '')
        .join('')
    })
    .join('\n\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PublishPayload
    const { submissionId, reviewer, note, category } = body

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
        primaryAuthor->{_id, name},
        coAuthors[]->{_id, name},
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
        processedContent = markdownToPortableText(plainText)
      } else {
        // Content is already properly formatted
        processedContent = submission.content
      }
    } else if (typeof submission.content === 'string' && submission.content.trim()) {
      // Content is a string, convert it
      processedContent = markdownToPortableText(submission.content)
    } else if (submission.contentSnapshot) {
      // Fall back to contentSnapshot (limited to 1000 chars, but better than nothing)
      processedContent = markdownToPortableText(submission.contentSnapshot)
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
          author: reviewer || 'Editor',
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
        reviewer,
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
