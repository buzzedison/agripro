import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agriprohub.com'

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

    // Send welcome email (non-blocking)
    if (resend) {
      const displayName = firstName ? firstName : email.split('@')[0]
      resend.emails.send({
        from: 'AgriPro Knowledge Hub <noreply@agriprohub.com>',
        to: email,
        subject: 'Welcome to the AgriPro Knowledge Hub',
        html: `
          <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;color:#111827;line-height:1.6;">
            <div style="background:#050A08;padding:32px 40px;border-radius:12px 12px 0 0;">
              <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;">You're in.</h1>
              <p style="color:#9ca3af;margin:8px 0 0;font-size:15px;">AgriPro Knowledge Hub</p>
            </div>
            <div style="background:#ffffff;padding:32px 40px;border:1px solid #e5e7eb;border-top:none;">
              <p>Hi ${displayName},</p>
              <p>Thanks for subscribing to the AgriPro Knowledge Hub — Africa's go-to resource for agribusiness intelligence, research, and expert insights.</p>

              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:24px 0;">
                <p style="margin:0 0 12px;font-weight:700;color:#15803d;font-size:14px;">WHAT YOU'LL GET</p>
                <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;">
                  <li style="margin-bottom:8px;">Latest research papers & whitepapers from across Africa</li>
                  <li style="margin-bottom:8px;">Expert insights on crops, markets, and agri-finance</li>
                  <li style="margin-bottom:8px;">Best practices from successful African agribusinesses</li>
                  <li style="margin-bottom:8px;">Market intelligence and data-backed analysis</li>
                </ul>
              </div>

              <p style="margin-top:24px;">Start exploring now:</p>
              <p>
                <a href="${SITE_URL}/knowledgehub" style="display:inline-block;background:#16a34a;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;">
                  Go to Knowledge Hub →
                </a>
              </p>

              <p style="margin-top:32px;color:#6b7280;font-size:13px;">
                Want to contribute? <a href="${SITE_URL}/knowledgehub/contributors" style="color:#15803d;">Become a contributor →</a>
              </p>
              <p style="margin-top:8px;">— The AgriPro Team</p>
            </div>
            <div style="padding:20px 40px;text-align:center;font-size:12px;color:#9ca3af;">
              <p style="margin:0;">© ${new Date().getFullYear()} AgriPro Hub. All rights reserved.</p>
              <p style="margin:4px 0 0;">You subscribed at <a href="${SITE_URL}/knowledgehub" style="color:#15803d;">${SITE_URL}/knowledgehub</a></p>
            </div>
          </div>
        `,
      }).catch((err: unknown) => console.error('Knowledge Hub welcome email error:', err))
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
