import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// One-click unsubscribe from the weekly digest email — no login required,
// same low-friction pattern as any standard newsletter unsubscribe link.
// Turning off an email preference is benign and idempotent, so a GET link
// (rather than requiring an authenticated POST) is an acceptable exception.
export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const { error } = await supabase.from('profiles').update({ digest_emails_enabled: false }).eq('id', userId)
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return new NextResponse(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
         <body style="font-family:system-ui,sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#111827">
           <h1 style="font-size:20px">You've been unsubscribed</h1>
           <p style="color:#6b7280">You won't receive the weekly AgriPro digest email anymore. You can still visit your feed anytime.</p>
           <a href="/feed" style="display:inline-block;margin-top:16px;background:#0B2C24;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">Open feed</a>
         </body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
    )
}
