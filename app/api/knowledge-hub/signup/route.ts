import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      firstName,
      lastName,
      signupSource = 'newsletter',
      userId
    } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('knowledge_hub_signups')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Already signed up',
        existing: true
      })
    }

    // Insert new signup
    const { data: signupData, error: signupError } = await supabase
      .from('knowledge_hub_signups')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        signup_source: signupSource,
        user_id: userId
      })
      .select()

    if (signupError) {
      console.error('Signup error:', signupError)
      return NextResponse.json({ error: 'Failed to sign up' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully signed up for Knowledge Hub',
      signupId: signupData?.[0]?.id
    })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get signup stats for public access (limited info)
export async function GET(request: NextRequest) {
  try {
    const { data: signups, error } = await supabase
      .from('knowledge_hub_signups')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Get signups error:', error)
      return NextResponse.json({ error: 'Failed to fetch signup stats' }, { status: 500 })
    }

    const totalSignups = signups?.length || 0

    // Calculate signups in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentSignups = signups?.filter(s =>
      new Date(s.created_at) > thirtyDaysAgo
    ).length || 0

    return NextResponse.json({
      totalSignups,
      recentSignups,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get signup stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
