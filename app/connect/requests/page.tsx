'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Users, Check, X, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nameToUniqueSlug } from '@/lib/utils/mentions';

interface RequestProfile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    organization_name: string | null;
    user_type: string | null;
}

interface PendingRequest {
    connectionId: string;
    requesterId: string;
    requestedAt: string;
    profile: RequestProfile | null;
}

export default function ConnectionRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioning, setActioning] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/connections/requests');
            if (response.status === 401) {
                router.push('/auth/login?redirectTo=/connect/requests');
                return;
            }
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Failed to load connection requests');
                return;
            }
            setRequests(data.requests || []);
        } catch (err: any) {
            setError(err?.message || 'Failed to load connection requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requesterId: string, action: 'accept' | 'reject') => {
        setActioning(requesterId);
        setError(null);
        try {
            const response = await fetch('/api/connections/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requesterId, action })
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }
            setRequests((prev) => prev.filter((req) => req.requesterId !== requesterId));
        } catch (err: any) {
            setError(err?.message || 'Something went wrong');
        } finally {
            setActioning(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Connection Requests</h1>
                        <p className="text-sm text-gray-500">
                            Review invitations from other professionals and grow your network.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h2>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            You’ll be notified when someone new wants to connect with you. Browse the directory
                            to find people you’d like to collaborate with.
                        </p>
                        <Link
                            href="/connect/directory"
                            className="inline-flex items-center justify-center px-4 py-2 mt-4 text-sm font-semibold text-green-700 bg-green-50 rounded-full hover:bg-green-100"
                        >
                            Explore members
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => {
                            const profile = request.profile;
                            const profileHref =
                                profile?.full_name && profile?.id
                                    ? `/connect/${nameToUniqueSlug(profile.full_name, profile.id)}`
                                    : '/connect';
                            return (
                                <div
                                    key={request.connectionId}
                                    className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm"
                                >
                                    <Link href={profileHref} className="flex items-center gap-3 flex-1">
                                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {profile?.avatar_url ? (
                                                <Image
                                                    src={profile.avatar_url}
                                                    alt={profile.full_name || ''}
                                                    width={56}
                                                    height={56}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-xl font-semibold text-gray-500">
                                                    {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{profile?.full_name || 'AgriPro member'}</p>
                                            {profile?.organization_name && (
                                                <p className="text-sm text-gray-600">{profile.organization_name}</p>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                Requested {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAction(request.requesterId, 'accept')}
                                            disabled={actioning === request.requesterId}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {actioning === request.requesterId ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Accept
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleAction(request.requesterId, 'reject')}
                                            disabled={actioning === request.requesterId}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
