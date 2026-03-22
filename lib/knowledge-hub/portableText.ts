import { randomUUID } from 'crypto'

type FetchClient = {
  fetch: <T = any>(query: string, params?: Record<string, unknown>) => Promise<T>
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

function createListItem(text: string, listItem: 'bullet' | 'number'): any {
  return {
    _type: 'block',
    _key: randomUUID(),
    style: 'normal',
    listItem,
    level: 1,
    markDefs: [],
    children: parseInlineMarks(text),
  }
}

async function createImageBlock(imageUrl: string, altText?: string, fetchClient?: FetchClient): Promise<any | null> {
  const assetId = await resolveImageAssetId(imageUrl, fetchClient)

  if (!assetId) {
    return null
  }

  return {
    _type: 'image',
    _key: randomUUID(),
    asset: {
      _type: 'reference',
      _ref: assetId,
    },
    ...(altText ? { alt: altText } : {}),
  }
}

async function resolveImageAssetId(imageUrl: string, fetchClient?: FetchClient): Promise<string | null> {
  if (!fetchClient || !imageUrl) {
    return null
  }

  let path = ''

  try {
    path = new URL(imageUrl).pathname.replace(/^\/+/, '')
  } catch {
    path = ''
  }

  try {
    const asset = await fetchClient.fetch<{ _id?: string }>(
      `*[_type == "sanity.imageAsset" && (url == $url || path == $path)][0]{ _id }`,
      { url: imageUrl, path }
    )

    return asset?._id ?? null
  } catch (error) {
    console.warn('Failed to resolve inline image asset', { imageUrl, error })
    return null
  }
}

export async function markdownToPortableText(markdown: string, fetchClient?: FetchClient): Promise<any[]> {
  const blocks: any[] = []
  const lines = markdown.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      i++
      continue
    }

    if (trimmedLine.startsWith('### ')) {
      blocks.push(createBlock(trimmedLine.slice(4), 'h3'))
      i++
      continue
    }

    if (trimmedLine.startsWith('## ')) {
      blocks.push(createBlock(trimmedLine.slice(3), 'h2'))
      i++
      continue
    }

    if (trimmedLine.startsWith('# ')) {
      blocks.push(createBlock(trimmedLine.slice(2), 'h1'))
      i++
      continue
    }

    if (trimmedLine.startsWith('> ')) {
      const quoteLines: string[] = []

      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2))
        i++
      }

      blocks.push(createBlock(quoteLines.join(' '), 'blockquote'))
      continue
    }

    if (trimmedLine.match(/^[-*]\s/)) {
      while (i < lines.length && lines[i].trim().match(/^[-*]\s/)) {
        blocks.push(createListItem(lines[i].trim().replace(/^[-*]\s/, ''), 'bullet'))
        i++
      }

      continue
    }

    if (trimmedLine.match(/^\d+\.\s/)) {
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        blocks.push(createListItem(lines[i].trim().replace(/^\d+\.\s/, ''), 'number'))
        i++
      }

      continue
    }

    const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)$/)
    if (imageMatch) {
      const [, altText, imageUrl, titleText] = imageMatch
      const imageBlock = await createImageBlock(imageUrl, altText || titleText, fetchClient)

      if (imageBlock) {
        blocks.push(imageBlock)
      } else {
        blocks.push(createBlock(altText || imageUrl, 'normal'))
      }

      i++
      continue
    }

    const paragraphLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().match(/^[-*]\s/) &&
      !lines[i].trim().match(/^\d+\.\s/) &&
      !lines[i].trim().match(/^!\[/)
    ) {
      paragraphLines.push(lines[i].trim())
      i++
    }

    if (paragraphLines.length > 0) {
      blocks.push(createBlock(paragraphLines.join(' '), 'normal'))
    }
  }

  return blocks
}

export function parseInlineMarks(text: string): any[] {
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
      continue
    }

    if (segment.startsWith('*') && segment.endsWith('*') && !segment.startsWith('**')) {
      children.push({
        _type: 'span',
        _key: randomUUID(),
        marks: ['em'],
        text: segment.slice(1, -1),
      })
      continue
    }

    children.push({
      _type: 'span',
      _key: randomUUID(),
      marks: [],
      text: segment,
    })
  }

  if (children.length === 0) {
    children.push({
      _type: 'span',
      _key: randomUUID(),
      marks: [],
      text,
    })
  }

  return children
}

export function portableTextToPlainText(blocks: any[]): string {
  if (!Array.isArray(blocks)) return ''

  return blocks
    .map((block) => {
      if (block?._type !== 'block' || !Array.isArray(block.children)) return ''

      return block.children
        .map((child: any) => child?.text ?? '')
        .join('')
    })
    .join('\n\n')
}

export function isPortableText(content: any): boolean {
  return Array.isArray(content) && content.length > 0 && content.every((block) => typeof block?._type === 'string')
}
