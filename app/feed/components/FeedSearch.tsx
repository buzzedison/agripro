'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { nameToUniqueSlug } from '@/lib/utils/mentions';
import { Search, Loader2, X, FileText, User as UserIcon } from 'lucide-react';

interface PersonResult {
    id: string;
    full_name: string;
    avatar_url: string | null;
    organization_name: string | null;
    user_type: string | null;
}

interface PostResult {
    id: string;
    content: string;
    image_url: string | null;
    created_at: string;
    author?: { full_name: string; avatar_url: string | null } | null;
}

const userTypeLabels: Record<string, string> = {
    farmer: 'Farmer',
    buyer: 'Buyer',
    expert: 'Expert',
    service_provider: 'Service Provider',
};

export default function FeedSearch() {
    const supabase = createClient();
    const containerRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [people, setPeople] = useState<PersonResult[]>([]);
    const [posts, setPosts] = useState<PostResult[]>([]);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setPeople([]);
            setPosts([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(async () => {
            try {
                const [{ data: peopleData }, { data: postsData }] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, organization_name, user_type')
                        .or(`full_name.ilike.%${q}%,organization_name.ilike.%${q}%`)
                        .limit(5),
                    supabase
                        .from('posts')
                        .select('id, content, image_url, created_at, user_id')
                        .ilike('content', `%${q}%`)
                        .order('created_at', { ascending: false })
                        .limit(5),
                ]);

                let postsWithAuthors: PostResult[] = postsData || [];
                if (postsWithAuthors.length > 0) {
                    const authorIds = [...new Set(postsWithAuthors.map((p: any) => p.user_id))];
                    const { data: authors } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .in('id', authorIds);
                    const authorMap = new Map((authors || []).map((a) => [a.id, a]));
                    postsWithAuthors = postsWithAuthors.map((p: any) => ({
                        ...p,
                        author: authorMap.get(p.user_id) || null,
                    }));
                }

                setPeople(peopleData || []);
                setPosts(postsWithAuthors);
                setSearched(true);
            } catch {
                setPeople([]);
                setPosts([]);
                setSearched(true);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [query, supabase]);

    const hasResults = people.length > 0 || posts.length > 0;
    const clear = () => {
        setQuery('');
        setPeople([]);
        setPosts([]);
        setSearched(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false);
                }}
                placeholder="Search people & posts..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {query && (
                <button
                    onClick={clear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            {open && query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-30 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                    ) : !hasResults && searched ? (
                        <div className="py-8 text-center text-sm text-gray-400">
                            No results for &ldquo;{query}&rdquo;
                        </div>
                    ) : (
                        <>
                            {people.length > 0 && (
                                <div>
                                    <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">People</p>
                                    {people.map((person) => (
                                        <Link
                                            key={person.id}
                                            href={`/connect/${nameToUniqueSlug(person.full_name, person.id)}`}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {person.avatar_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{person.full_name}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {person.organization_name || userTypeLabels[person.user_type || ''] || ''}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {posts.length > 0 && (
                                <div className={people.length > 0 ? 'border-t border-gray-100' : ''}>
                                    <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Posts</p>
                                    {posts.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/feed/post/${post.id}`}
                                            onClick={() => setOpen(false)}
                                            className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-700 truncate">{post.author?.full_name || 'Unknown'}</p>
                                                <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
