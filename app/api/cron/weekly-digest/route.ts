import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'AgriPro <noreply@agriprohub.com>'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agripro.com'
const SEVEN_DAYS_AGO = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

interface DigestStats {
    newPostsCount: number
    topPosts: { id: string; content: string; author: string; likes_count: number }[]
    likesReceived: number
    commentsReceived: number
    newConnectionRequests: number
}

async function buildDigest(userId: string): Promise<DigestStats> {
    const since = SEVEN_DAYS_AGO()

    // Posts from accepted connections in the last 7 days
    const { data: connections } = await supabase
        .from('user_connections')
        .select('requester_id, receiver_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

    const connectionIds = (connections || []).map((c) =>
        c.requester_id === userId ? c.receiver_id : c.requester_id
    )

    let newPostsCount = 0
    let topPosts: DigestStats['topPosts'] = []
    if (connectionIds.length > 0) {
        const { data: posts, count } = await supabase
            .from('posts')
            .select('id, content, user_id, likes_count', { count: 'exact' })
            .in('user_id', connectionIds)
            .gte('created_at', since)
            .order('likes_count', { ascending: false })
            .limit(3)

        newPostsCount = count || 0
        if (posts && posts.length > 0) {
            const authorIds = [...new Set(posts.map((p) => p.user_id))]
            const { data: authors } = await supabase.from('profiles').select('id, full_name').in('id', authorIds)
            const authorMap = new Map((authors || []).map((a) => [a.id, a.full_name]))
            topPosts = posts.map((p) => ({
                id: p.id,
                content: p.content.slice(0, 140),
                author: authorMap.get(p.user_id) || 'Someone',
                likes_count: p.likes_count,
            }))
        }
    }

    // Activity on my own posts
    const { data: myPosts } = await supabase.from('posts').select('id').eq('user_id', userId)
    const myPostIds = (myPosts || []).map((p) => p.id)

    let likesReceived = 0
    let commentsReceived = 0
    if (myPostIds.length > 0) {
        const [{ count: likeCount }, { count: commentCount }] = await Promise.all([
            supabase.from('post_likes').select('id', { count: 'exact', head: true }).in('post_id', myPostIds).gte('created_at', since),
            supabase.from('post_comments').select('id', { count: 'exact', head: true }).in('post_id', myPostIds).gte('created_at', since),
        ])
        likesReceived = likeCount || 0
        commentsReceived = commentCount || 0
    }

    const { count: newConnectionRequests } = await supabase
        .from('user_connections')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .gte('created_at', since)

    return {
        newPostsCount,
        topPosts,
        likesReceived,
        commentsReceived,
        newConnectionRequests: newConnectionRequests || 0,
    }
}

function hasActivity(stats: DigestStats): boolean {
    return stats.newPostsCount > 0 || stats.likesReceived > 0 || stats.commentsReceived > 0 || stats.newConnectionRequests > 0
}

function renderDigestEmail(name: string, stats: DigestStats, userId: string): string {
    const postRows = stats.topPosts
        .map(
            (p) => `
        <div style="padding:14px 0;border-bottom:1px solid #f3f4f6">
          <p style="margin:0 0 4px;font-weight:600;color:#111827;font-size:14px">${p.author}</p>
          <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.5">${p.content}${p.content.length >= 140 ? '…' : ''}</p>
          <p style="margin:6px 0 0;color:#9ca3af;font-size:12px">${p.likes_count} like${p.likes_count === 1 ? '' : 's'}</p>
        </div>`
        )
        .join('')

    const statChip = (value: number, label: string) => `
      <td style="text-align:center;padding:0 8px">
        <p style="margin:0;font-size:24px;font-weight:800;color:#0B2C24">${value}</p>
        <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">${label}</p>
      </td>`

    return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#111827">
      <div style="background:#0B2C24;padding:28px 32px;border-radius:12px 12px 0 0">
        <p style="color:#4ade80;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px">AgriPro Weekly Digest</p>
        <h1 style="color:white;margin:0;font-size:22px">Here's what you missed, ${name.split(' ')[0]}</h1>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;overflow:hidden">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 8px;background:#f9fafb;border-bottom:1px solid #e5e7eb">
          <tr>
            ${statChip(stats.newPostsCount, 'New posts')}
            ${statChip(stats.likesReceived, 'Likes')}
            ${statChip(stats.commentsReceived, 'Comments')}
            ${statChip(stats.newConnectionRequests, 'Requests')}
          </tr>
        </table>
        ${postRows ? `<div style="padding:8px 24px">
          <p style="font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;margin:16px 0 4px">Top posts from your network</p>
          ${postRows}
        </div>` : ''}
        <div style="padding:24px;text-align:center">
          <a href="${SITE_URL}/feed" style="display:inline-block;background:#0B2C24;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Open your feed →
          </a>
        </div>
        <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center">
          <p style="color:#9ca3af;font-size:12px;margin:0">
            <a href="${SITE_URL}/api/notifications/digest-unsubscribe?userId=${userId}" style="color:#9ca3af">Unsubscribe from weekly digests</a>
          </p>
        </div>
      </div>
    </div>`
}

// GET so Vercel Cron (which issues GET requests) can trigger it directly.
// Protected by CRON_SECRET — Vercel automatically attaches it as a Bearer
// token for scheduled invocations when the env var is set.
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('digest_emails_enabled', true)
        .not('email', 'is', null)

    if (error) {
        console.error('Weekly digest: failed to load users', error)
        return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
    }

    let sent = 0
    let skipped = 0

    for (const u of users || []) {
        if (!u.email) { skipped++; continue }
        try {
            const stats = await buildDigest(u.id)
            if (!hasActivity(stats)) { skipped++; continue }

            await resend.emails.send({
                from: FROM,
                to: [u.email],
                subject: `Your AgriPro week: ${stats.newPostsCount} new posts, ${stats.likesReceived + stats.commentsReceived} reactions`,
                html: renderDigestEmail(u.full_name || 'there', stats, u.id),
            })
            sent++
        } catch (err) {
            console.error(`Weekly digest failed for user ${u.id}:`, err)
        }
    }

    return NextResponse.json({ success: true, sent, skipped, total: users?.length || 0 })
}
