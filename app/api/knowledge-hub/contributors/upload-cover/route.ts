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

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const asset = await writeClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    })

    return NextResponse.json({
      assetId: asset._id,
      url: asset.url,
    })
  } catch (error) {
    console.error('Cover image upload failed', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

