import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET() {
  try {
    const count = await client.fetch(
      `count(*[_type == "contributorSubmission" && status == "submitted"])`
    )

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to fetch pending submissions count:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
