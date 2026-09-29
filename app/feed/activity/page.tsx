'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PracticalPostCard from '../components/PracticalPostCard';
import { PracticalPost } from '@/lib/practical-feed';
import { communityError } from '@/lib/feed-community';
import { REPORT_REASON_LABELS, ReportReason } from '@/lib/moderation';
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

type ReviewPost = PracticalPost & { id: string; content: string; moderation_status: string; moderation_feedback: string | null; created_at: string };
type Report = { id: string; target_type: string; reason: ReportReason; status: string; created_at: string };
type Appeal = { id: string; post_id: string | null; message: string; status: string; response: string | null; created_at: string };
const statusLabel: Record<string,string> = { published: 'Approved & published', pending: 'Awaiting review', reviewed: 'Under review', actioned: 'Action taken', dismissed: 'Review complete · no action', accepted: 'Appeal accepted', rejected: 'Not approved' };

export default function FeedActivity() {
    const supabase = createClient();
    const router = useRouter();
    const [posts, setPosts] = useState<ReviewPost[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [restriction, setRestriction] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [appealTarget, setAppealTarget] = useState<string | null | undefined>(undefined);
    const [message, setMessage] = useState('');
    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.replace('/auth/login?redirectTo=/feed/activity'); return; }
            const results = await Promise.all([
                supabase.from('posts').select('id,user_id,content,moderation_status,moderation_feedback,created_at,post_kind,post_details,is_closed,expires_at').eq('user_id',user.id).or('moderation_status.in.(pending,rejected),moderation_feedback.not.is.null').order('created_at',{ascending:false}).limit(50),
                supabase.rpc('my_feed_reports'),
                supabase.from('feed_appeals').select('id,post_id,message,status,response,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50),
                supabase.from('profiles').select('is_blocked,is_suspended,suspended_until').eq('id',user.id).single(),
            ]);
            for (const result of results) if (result.error) throw result.error;
            setPosts(results[0].data || []); setReports(results[1].data || []); setAppeals(results[2].data || []);
            const profile = results[3].data;
            setRestriction(profile?.is_blocked ? 'Your feed access is blocked.' : profile?.is_suspended && (!profile.suspended_until || new Date(profile.suspended_until)>new Date()) ? `Your feed access is suspended${profile.suspended_until ? ' until '+new Date(profile.suspended_until).toLocaleString() : ''}.` : '');
        } catch (error) { setError(communityError(error)); }
        finally { setLoading(false); }
    }, [supabase,router]);
    useEffect(() => { load(); },[load]);
    const canAppeal = (postId: string | null) => !appeals.some(a => a.post_id===postId && a.status==='pending');
    async function submit(event: React.FormEvent) {
        event.preventDefault(); setBusy(true); setError(''); setSuccess('');
        try {
            const { error } = await supabase.rpc('submit_feed_appeal',{p_message:message,p_post:appealTarget});
            if (error) throw error;
            setAppealTarget(undefined); setMessage(''); await load(); setSuccess('Appeal submitted. You can track the response below.');
        } catch (error) { setError(communityError(error)); } finally { setBusy(false); }
    }
    return <main className="min-h-screen bg-gray-50 px-4 py-10"><div className="mx-auto max-w-3xl space-y-6">
        <Link href="/feed" className="inline-flex items-center gap-2 text-sm font-semibold text-green-700"><ArrowLeft className="h-4 w-4" /> Back to feed</Link>
        <header><p className="text-xs font-semibold uppercase tracking-widest text-green-700">Community support</p><h1 className="mt-2 text-3xl font-bold text-gray-900">My activity & appeals</h1><p className="mt-2 text-sm text-gray-500">Check your posts, report outcomes, and responses from the moderation team. Showing the latest 50 in each section.</p></header>
        {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={load} className="ml-3 underline">Retry</button></div>}
        {success && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">{success}</p>}
        {loading ? <Loader2 aria-label="Loading activity" className="mx-auto h-6 w-6 animate-spin" /> : <>
            <section className={`rounded-2xl border p-5 ${restriction ? 'border-amber-200 bg-amber-50' : 'border-green-100 bg-white'}`}><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5" /> Feed access</h2><p className="mt-2 text-sm text-gray-600">{restriction || 'Your account has access to the community feed.'}</p>{restriction && (canAppeal(null) ? <button onClick={() => { setAppealTarget(null); setMessage(''); }} className="mt-3 text-sm font-semibold text-green-700 underline">Appeal this restriction</button> : <p className="mt-3 text-sm font-semibold">Your appeal is awaiting review.</p>)}</section>
            {appealTarget !== undefined && <form onSubmit={submit} className="space-y-3 rounded-2xl border border-green-200 bg-white p-5"><h2 className="font-semibold">Appeal {appealTarget ? 'a post decision' : 'your feed restriction'}</h2><label className="block text-sm text-gray-600">Tell us what we should reconsider<textarea required minLength={20} maxLength={2000} rows={4} value={message} onChange={e=>setMessage(e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label><div className="flex gap-3"><button disabled={busy || message.trim().length<20} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy?'Submitting…':'Submit appeal'}</button><button type="button" disabled={busy} onClick={()=>setAppealTarget(undefined)} className="px-3 text-sm">Cancel</button></div></form>}
            <section className="rounded-2xl border bg-white p-5"><h2 className="font-bold">My post reviews</h2><p className="mt-1 text-xs text-gray-500">Early posts with links or promotional pitches are reviewed before publication.</p><div className="mt-4 space-y-4">{posts.length ? posts.map(post=><article key={post.id} className="border-t pt-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{statusLabel[post.moderation_status]}</span><div className="mt-3"><PracticalPostCard post={post} preview /></div><p className="mt-3 whitespace-pre-wrap break-words text-sm">{post.content}</p>{post.moderation_feedback && <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">Team response: {post.moderation_feedback}</p>}{post.moderation_status==='rejected' && (canAppeal(post.id) ? <button onClick={()=>{setAppealTarget(post.id);setMessage('');}} className="mt-3 text-sm font-semibold text-green-700 underline">Appeal decision</button> : <p className="mt-2 text-xs text-gray-500">Appeal awaiting review</p>)}</article>) : <p className="text-sm text-gray-500">No post reviews yet.</p>}</div></section>
            <section className="rounded-2xl border bg-white p-5"><h2 className="font-bold">My reports</h2><div className="mt-4 space-y-4">{reports.length ? reports.map(report=><article key={report.id} className="flex flex-wrap justify-between gap-2 border-t pt-3 text-sm"><div><p>{REPORT_REASON_LABELS[report.reason]} · {report.target_type === 'enquiry_message' ? 'Private message' : report.target_type}</p><p className="mt-1 text-xs text-gray-400">{new Date(report.created_at).toLocaleString()} · {report.id.slice(0,8)}</p></div><span className="text-xs font-semibold text-gray-600">{statusLabel[report.status]}</span></article>) : <p className="text-sm text-gray-500">You haven’t submitted any reports.</p>}</div></section>
            <section className="rounded-2xl border bg-white p-5"><h2 className="font-bold">My appeals</h2><div className="mt-4 space-y-4">{appeals.length ? appeals.map(appeal=><article key={appeal.id} className="border-t pt-3 text-sm"><p className="font-semibold">{appeal.post_id?'Post decision':'Feed restriction'} · {statusLabel[appeal.status]}</p><p className="mt-2 break-words text-gray-600">{appeal.message}</p>{appeal.response && <p className="mt-2 rounded-lg bg-green-50 p-3 text-green-900">Team response: {appeal.response}</p>}</article>) : <p className="text-sm text-gray-500">No appeals submitted.</p>}</div></section>
        </>}
    </div></main>;
}
