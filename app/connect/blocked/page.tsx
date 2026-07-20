'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { unblockUser, unmuteUser } from '@/lib/moderation';
import { ArrowLeft, UserX, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { nameToUniqueSlug } from '@/lib/utils/mentions';

interface ListedUser {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

export default function BlockedAndMutedPage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'blocked' | 'muted'>('blocked');
    const [blocked, setBlocked] = useState<ListedUser[]>([]);
    const [muted, setMuted] = useState<ListedUser[]>([]);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                router.push('/auth/login?redirectTo=/connect/blocked');
                return;
            }
            setUser(currentUser);

            const [{ data: blockRows }, { data: muteRows }] = await Promise.all([
                supabase.from('user_blocks').select('blocked_id').eq('blocker_id', currentUser.id),
                supabase.from('user_mutes').select('muted_id').eq('muter_id', currentUser.id),
            ]);

            const blockedIds = (blockRows || []).map((r) => r.blocked_id);
            const mutedIds = (muteRows || []).map((r) => r.muted_id);
            const allIds = [...new Set([...blockedIds, ...mutedIds])];

            if (allIds.length > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', allIds);
                const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
                setBlocked(blockedIds.map((id) => profileMap.get(id)).filter(Boolean) as ListedUser[]);
                setMuted(mutedIds.map((id) => profileMap.get(id)).filter(Boolean) as ListedUser[]);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleUnblock = async (targetId: string) => {
        if (!user) return;
        setBusyId(targetId);
        try {
            await unblockUser(user.id, targetId);
            setBlocked((prev) => prev.filter((p) => p.id !== targetId));
            toast.success('Unblocked');
        } catch {
            toast.error('Could not unblock this user');
        } finally {
            setBusyId(null);
        }
    };

    const handleUnmute = async (targetId: string) => {
        if (!user) return;
        setBusyId(targetId);
        try {
            await unmuteUser(user.id, targetId);
            setMuted((prev) => prev.filter((p) => p.id !== targetId));
            toast.success('Unmuted');
        } catch {
            toast.error('Could not unmute this user');
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    const list = tab === 'blocked' ? blocked : muted;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link href="/connect/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 mb-6">
                    <ArrowLeft className="w-4 h-4" /> Back to dashboard
                </Link>

                <h1 className="text-2xl font-bold text-gray-900 mb-1">Blocked & muted accounts</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Manage who you&apos;ve blocked or muted. Blocking hides your content from them and stops
                    messages both ways; muting just hides their posts from your feed.
                </p>

                <div className="inline-flex items-center gap-1 p-1 mb-5 rounded-lg bg-gray-100">
                    <button
                        onClick={() => setTab('blocked')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'blocked' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Blocked ({blocked.length})
                    </button>
                    <button
                        onClick={() => setTab('muted')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'muted' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Muted ({muted.length})
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                    {list.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-400">
                            {tab === 'blocked' ? (
                                <>
                                    <UserX className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    No one blocked.
                                </>
                            ) : (
                                <>
                                    <BellOff className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    No one muted.
                                </>
                            )}
                        </div>
                    ) : (
                        list.map((person) => (
                            <div key={person.id} className="flex items-center gap-3 px-5 py-3.5">
                                <Link href={`/connect/${nameToUniqueSlug(person.full_name, person.id)}`} className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {person.avatar_url ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-gray-400">{person.full_name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 truncate">{person.full_name}</span>
                                </Link>
                                <button
                                    onClick={() => (tab === 'blocked' ? handleUnblock(person.id) : handleUnmute(person.id))}
                                    disabled={busyId === person.id}
                                    className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 shrink-0"
                                >
                                    {busyId === person.id ? '...' : tab === 'blocked' ? 'Unblock' : 'Unmute'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
