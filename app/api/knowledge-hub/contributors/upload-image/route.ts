import { NextRequest, NextResponse } from 'next/server'
import { getSanityWriteClient } from '@/sanity/lib/serverClient'

const writeClient = getSanityWriteClient()

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, GIF, and WebP images are allowed' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const asset = await writeClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    })

    return NextResponse.json({
      assetId: asset._id,
      url: asset.url,
      originalFilename: asset.originalFilename,
      mimeType: asset.mimeType,
    })
  } catch (error) {
    console.error('Image upload failed', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
