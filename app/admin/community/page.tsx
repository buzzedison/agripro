'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { communityError, FeedAnnouncement } from '@/lib/feed-community';
import PracticalPostCard from '@/app/feed/components/PracticalPostCard';
import { PracticalPost } from '@/lib/practical-feed';
import MemberModeration from '../components/MemberModeration';

type ReviewPost = PracticalPost & { id: string; user_id: string; content: string; image_url: string | null; gif_url: string | null; created_at: string; updated_at: string };
type Appeal = { id: string; user_id: string; post_id: string | null; message: string; created_at: string };
type Tab = 'posts' | 'appeals' | 'announcements';

export default function CommunityAdmin() {
    const supabase = createClient();
    const [tab,setTab] = useState<Tab>('posts');
    const [allowed,setAllowed] = useState(false);
    const [posts,setPosts] = useState<ReviewPost[]>([]);
    const [appeals,setAppeals] = useState<Appeal[]>([]);
    const [announcements,setAnnouncements] = useState<FeedAnnouncement[]>([]);
    const [names,setNames] = useState<Record<string,string>>({});
    const [feedback,setFeedback] = useState<Record<string,string>>({});
    const [error,setError] = useState('');
    const [success,setSuccess] = useState('');
    const [loading,setLoading] = useState(true);
    const [busy,setBusy] = useState(false);
    const [title,setTitle] = useState('');
    const [body,setBody] = useState('');
    const [expires,setExpires] = useState('');
    const load = useCallback(async () => {
        setLoading(true);setError('');setAllowed(false);
        try {
            const { data: isAdmin,error: authError } = await supabase.rpc('is_admin_user');
            if (authError || !isAdmin) throw new Error('Admin access is required to manage the community.');
            setAllowed(true);
            const results=await Promise.all([
                supabase.from('posts').select('id,user_id,content,image_url,gif_url,created_at,updated_at,post_kind,post_details,moderation_status,is_closed,expires_at').eq('moderation_status','pending').order('created_at',{ascending:true}).limit(50),
                supabase.from('feed_appeals').select('id,user_id,post_id,message,created_at').eq('status','pending').order('created_at',{ascending:true}).limit(50),
                supabase.from('feed_announcements').select('id,title,body,active,expires_at').order('created_at',{ascending:false}).limit(50),
            ]);
            for(const result of results) if(result.error) throw result.error;
            setPosts(results[0].data || []);setAppeals(results[1].data || []);setAnnouncements(results[2].data || []);
            const ids=[...new Set([...(results[0].data || []),...(results[1].data || [])].map(row=>row.user_id))];
            if(ids.length){const {data}=await supabase.from('profiles').select('id,full_name').in('id',ids);setNames(Object.fromEntries((data || []).map(p=>[p.id,p.full_name || 'Member'])));}
        } catch(error){setError(communityError(error));} finally{setLoading(false);}
    },[supabase]);
    useEffect(()=>{load();},[load]);
    async function act(operation:()=>PromiseLike<{error: unknown}>,message: string){
        setBusy(true);setError('');setSuccess('');
        try{const result=await operation();if(result.error)throw result.error;await load();setSuccess(message);return true;}catch(error){setError(communityError(error));return false;}finally{setBusy(false);}
    }
    const decisionInput=(id:string)=><label className="mt-4 block text-xs font-semibold text-gray-600">Response visible to the member<textarea value={feedback[id] || ''} onChange={e=>setFeedback({...feedback,[id]:e.target.value})} rows={2} minLength={5} maxLength={1000} className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm font-normal" placeholder="Explain your decision…" /></label>;
    return <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
        <header><p className="text-xs font-semibold uppercase tracking-widest text-green-700">Community care</p><h1 className="mt-2 text-3xl font-bold">Review & announcements</h1><p className="mt-2 text-sm text-gray-500">Review early posts, resolve appeals, and pin updates. Queues show the oldest 50 items first; reviewed items leave the queue.</p></header>
        <div className="flex flex-wrap gap-2">{(['posts','appeals','announcements'] as Tab[]).map(value=><button key={value} onClick={()=>setTab(value)} aria-pressed={tab===value} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab===value?'bg-green-700 text-white':'border bg-white text-gray-600'}`}>{value==='posts'?'Post review':value==='appeals'?'Appeals':'Announcements'}</button>)}<button onClick={load} disabled={busy || loading} className="ml-auto text-sm font-semibold text-green-700">Refresh</button></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{success && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-800">{success}</p>}
        {loading ? <p role="status" className="p-8 text-center text-sm text-gray-500">Loading community tools…</p> : allowed && <>
            {tab==='posts' && <div className="space-y-4">{posts.length ? posts.map(post=><article key={post.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold">{names[post.user_id] || 'Member'}</h2><span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span></div><div className="mt-3"><PracticalPostCard post={post} preview /></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{post.content}</p>{(post.image_url || post.gif_url) && <Link href={`/feed/post/${post.id}`} target="_blank" className="mt-3 inline-block text-sm font-semibold text-green-700 underline">Inspect attached media</Link>}{decisionInput(post.id)}<div className="mt-3 flex flex-wrap gap-2"><button disabled={busy || (feedback[post.id] || '').trim().length<5} onClick={()=>act(()=>supabase.rpc('review_feed_post',{p_post:post.id,p_decision:'published',p_feedback:feedback[post.id],p_updated_at:post.updated_at}),'Post approved and published.')} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Approve</button><button disabled={busy || (feedback[post.id] || '').trim().length<5} onClick={()=>act(()=>supabase.rpc('review_feed_post',{p_post:post.id,p_decision:'rejected',p_feedback:feedback[post.id],p_updated_at:post.updated_at}),'Post rejected. The member can see your response.')} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-40">Reject</button><MemberModeration userId={post.user_id} name={names[post.user_id] || 'member'} onComplete={load} /></div></article>) : <Empty text="No posts awaiting review." />}</div>}
            {tab==='appeals' && <div className="space-y-4">{appeals.length ? appeals.map(appeal=><article key={appeal.id} className="rounded-2xl border bg-white p-5"><h2 className="font-bold">{names[appeal.user_id] || 'Member'} · {appeal.post_id?'Post appeal':'Account appeal'}</h2><p className="mt-3 whitespace-pre-wrap break-words text-sm">{appeal.message}</p><div className="mt-3 flex gap-3"><Link href={appeal.post_id?`/feed/post/${appeal.post_id}`:`/connect/${appeal.user_id}`} target="_blank" className="text-sm font-semibold text-green-700 underline">View {appeal.post_id?'post':'profile'}</Link><MemberModeration userId={appeal.user_id} name={names[appeal.user_id] || 'member'} onComplete={load} /></div>{decisionInput(appeal.id)}<div className="mt-3 flex gap-2">{[true,false].map(accept=><button key={String(accept)} disabled={busy || (feedback[appeal.id] || '').trim().length<5} onClick={()=>act(()=>supabase.rpc('review_feed_appeal',{p_appeal:appeal.id,p_accept:accept,p_response:feedback[appeal.id]}),accept?'Appeal accepted; access or post restored.':'Appeal declined; response saved.')} className={`rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40 ${accept?'bg-green-700 text-white':'border text-gray-700'}`}>{accept?'Accept & restore':'Decline appeal'}</button>)}</div></article>) : <Empty text="No appeals awaiting review." />}</div>}
            {tab==='announcements' && <div className="space-y-4"><form onSubmit={event=>{event.preventDefault();act(()=>supabase.from('feed_announcements').insert({title,body,expires_at:expires?new Date(expires).toISOString():null}),'Announcement pinned to the feed.').then(saved=>{if(saved){setTitle('');setBody('');setExpires('');}});}} className="space-y-4 rounded-2xl border bg-white p-5"><h2 className="font-bold">Pin an announcement</h2><label className="block text-sm">Title<input required minLength={3} maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label><label className="block text-sm">Message<textarea required minLength={5} maxLength={2000} value={body} onChange={e=>setBody(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border p-3" /></label><label className="block text-sm">Expiry (optional, your local time)<input type="datetime-local" value={expires} onChange={e=>setExpires(e.target.value)} className="mt-1 block rounded-lg border p-3" /></label><p className="text-xs text-gray-500">The three newest active announcements appear above the feed.</p><button disabled={busy} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Publish announcement</button></form>{announcements.map(item=><article key={item.id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between gap-3"><h2 className="font-bold">{item.title}</h2><span className="text-xs text-gray-500">{!item.active?'Unpinned':item.expires_at && new Date(item.expires_at)<=new Date()?'Expired':'Active'}</span></div><p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-600">{item.body}</p><button disabled={busy} onClick={()=>act(()=>supabase.from('feed_announcements').update({active:!item.active || !!(item.expires_at && new Date(item.expires_at)<=new Date()),...(!item.active || (item.expires_at && new Date(item.expires_at)<=new Date()) ? {expires_at:null} : {})}).eq('id',item.id),'Announcement updated.')} className="mt-3 text-sm font-semibold text-green-700 underline">{item.active && (!item.expires_at || new Date(item.expires_at)>new Date())?'Unpin':'Pin again'}</button></article>)}</div>}
        </>}
    </main>;
}
function Empty({text}:{text:string}){return <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-gray-500">{text}</p>;}
