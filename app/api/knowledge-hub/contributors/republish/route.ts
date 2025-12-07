import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { getSanityWriteClient } from '@/sanity/lib/serverClient'
import { client as readClient } from '@/sanity/lib/client'

const writeClient = getSanityWriteClient()

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
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        blocks.push({
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
      continue
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        blocks.push({
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
      continue
    }

    // Image (markdown syntax) - skip for now
    if (line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)) {
      i++
      continue
    }

    // Regular paragraph
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

function parseInlineMarks(text: string): any[] {
  const children: any[] = []
  const segments = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  
  for (const segment of segments) {
    if (!segment) continue
    
    if (segment.startsWith('**') && segment.endsWith('**')) {
      children.push({
        _type: 'span',
        _key: randomUUID(),
        marks: ['strong'],
        text: segment.slice(2, -2),
      })
    } else if (segment.startsWith('*') && segment.endsWith('*') && !segment.startsWith('**')) {
      children.push({
        _type: 'span',
        _key: randomUUID(),
        marks: ['em'],
        text: segment.slice(1, -1),
      })
    } else {
      children.push({
        _type: 'span',
        _key: randomUUID(),
        marks: [],
        text: segment,
      })
    }
  }

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

/**
 * Republish/update an existing insight's content from its linked submission
 */
export async function POST(request: NextRequest) {
  try {
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
    const processedContent = markdownToPortableText(plainText)

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
