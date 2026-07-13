'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { CatalystFellow, FellowContribution } from '@/lib/fellows';
import { designationLabel } from '@/lib/fellows/designation';
import { graceInfo, RATING_LABEL, RATING_BADGE, GRACE_PERIOD_DAYS, type WeeklyScore } from '@/lib/fellows/accountability';
import { updateFellowProfile } from './actions';
import {
    User, Briefcase, Link2, BookOpen, Eye, EyeOff, Camera,
    CheckCircle, AlertCircle, ExternalLink, Loader2, Sparkles, ShieldCheck, Clock,
} from 'lucide-react';

const STATUS_BADGES: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    approved: 'bg-blue-100 text-blue-700',
    submitted: 'bg-amber-100 text-amber-700',
    draft: 'bg-gray-100 text-gray-600',
    rejected: 'bg-red-100 text-red-600',
};

export default function PortalClient({
    fellow,
    contributions,
    scores = [],
    viewerId,
    adminMode = false,
}: {
    fellow: CatalystFellow;
    contributions: FellowContribution[];
    scores?: WeeklyScore[];
    viewerId: string;
    adminMode?: boolean;
}) {
    const connectUserId = adminMode ? fellow.user_id : viewerId;
    const supabase = createClient();
    const [photoUrl, setPhotoUrl] = useState(fellow.photo_url || '');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [hasBusiness, setHasBusiness] = useState(fellow.has_business);
    const [isPublic, setIsPublic] = useState(fellow.is_public !== false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isPending, startTransition] = useTransition();

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPhoto(true);
        setMessage(null);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${viewerId}/fellow-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            setPhotoUrl(publicUrl);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setMessage({ type: 'error', text: 'Photo upload failed: ' + msg });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleSubmit = (formData: FormData) => {
        setMessage(null);
        startTransition(async () => {
            const result = await updateFellowProfile(formData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Profile saved.' });
            }
        });
    };

    const inputClass =
        'w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#0B2C24] focus:ring-2 focus:ring-[#0B2C24]/10 outline-none text-sm text-gray-900 bg-white transition-colors';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-[#0B2C24] text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                    {adminMode && (
                        <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-sm">
                            <span className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 shrink-0" />
                                Admin mode — you&apos;re editing {fellow.full_name}&apos;s profile.
                            </span>
                            <Link href="/fellowship/portal" className="shrink-0 underline hover:text-amber-100">
                                All fellows
                            </Link>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-amber-300 text-sm font-medium mb-2">
                        <Sparkles className="w-4 h-4" />
                        Catalyst Fellow Portal
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                        {adminMode ? fellow.full_name : `Welcome, ${fellow.full_name.split(' ')[0]}`}
                    </h1>
                    <p className="text-white/70 text-sm">
                        {designationLabel(fellow.designation)}
                        {adminMode
                            ? ' · Changes save directly to their profile.'
                            : ' · This is your profile across AgriPro — keep it fresh.'}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-5">
                        <Link
                            href={`/fellowship/fellows/${fellow.slug}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors"
                        >
                            <Eye className="w-4 h-4" /> View public profile
                        </Link>
                        {connectUserId && (
                            <Link
                                href={`/connect/${connectUserId}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" /> {adminMode ? 'Their Connect profile' : 'Your Connect profile'}
                            </Link>
                        )}
                        {!adminMode && (
                            <Link
                                href="/knowledgehub/contributors"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 text-[#0B2C24] font-medium hover:bg-amber-300 text-sm transition-colors"
                            >
                                <BookOpen className="w-4 h-4" /> Write for the Knowledge Hub
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Weekly commitment / accountability */}
            {fellow.weekly_hours_committed != null && (() => {
                const g = graceInfo(fellow.commitment_started_at ?? null);
                const rating = fellow.performance_rating ?? 'unrated';
                const ends = g.graceEndsAt?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                return (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center gap-x-8 gap-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0B2C24]/5 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-[#0B2C24]" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Weekly commitment</p>
                                    <p className="text-lg font-bold text-gray-900">{fellow.weekly_hours_committed} hrs/week</p>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-gray-100 hidden sm:block" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Standing</p>
                                {g.inGrace ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                        Grace period · ends {ends}
                                    </span>
                                ) : (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RATING_BADGE[rating]}`}>
                                        {RATING_LABEL[rating]}
                                    </span>
                                )}
                            </div>
                            <div className="h-8 w-px bg-gray-100 hidden sm:block" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Points</p>
                                <p className="text-lg font-bold text-gray-900">{fellow.total_points ?? 0}</p>
                            </div>
                            <p className="text-xs text-gray-400 basis-full sm:basis-auto sm:ml-auto sm:max-w-xs sm:text-right">
                                {adminMode
                                    ? 'Weekly task scores are recorded from the admin fellows panel.'
                                    : `Complete your weekly tasks to earn points. After a ${GRACE_PERIOD_DAYS}-day grace period, activity is reviewed.`}
                            </p>

                            {scores.length > 0 && (
                                <div className="basis-full mt-1 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                                    {scores.slice(0, 5).map((sc) => (
                                    <span
                                        key={sc.id}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${RATING_BADGE[sc.rating]}`}
                                        title={`${sc.tasks_done}${sc.tasks_assigned != null ? `/${sc.tasks_assigned}` : ''} tasks · ${sc.points} pts`}
                                    >
                                            {new Date(sc.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            <span className="opacity-70">· {sc.points}pt</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile form */}
                <form action={handleSubmit} className="lg:col-span-2 space-y-6">
                    {adminMode && <input type="hidden" name="fellow_id" value={fellow.id} />}
                    {message && (
                        <div
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                                message.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                        >
                            {message.type === 'success' ? (
                                <CheckCircle className="w-4 h-4 shrink-0" />
                            ) : (
                                <AlertCircle className="w-4 h-4 shrink-0" />
                            )}
                            {message.text}
                        </div>
                    )}

                    {/* About */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-5">
                            <User className="w-4 h-4 text-[#0B2C24]" /> Who you are
                        </h2>

                        <div className="flex items-center gap-4 mb-5">
                            <div className="relative">
                                {photoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={photoUrl}
                                        alt={fellow.full_name}
                                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-[#0B2C24] text-white flex items-center justify-center text-2xl font-bold">
                                        {fellow.full_name.charAt(0)}
                                    </div>
                                )}
                                <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                    {uploadingPhoto ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                    ) : (
                                        <Camera className="w-4 h-4 text-gray-600" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handlePhotoUpload}
                                        disabled={uploadingPhoto}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">
                                Upload a clear headshot — it appears on the public fellows directory.
                            </p>
                            <input type="hidden" name="photo_url" value={photoUrl} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Full name</label>
                                <input name="full_name" defaultValue={fellow.full_name} required className={inputClass} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Your role in AgriPro</label>
                                <input
                                    name="role_in_agripro"
                                    defaultValue={fellow.role_in_agripro || ''}
                                    placeholder="e.g. Programmes Lead, Catalyst-W planning team"
                                    className={inputClass}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Bio — who you are &amp; what you do</label>
                                <textarea
                                    name="bio"
                                    defaultValue={fellow.bio || ''}
                                    rows={4}
                                    placeholder="Tell the community about yourself, your background and what you work on."
                                    className={inputClass}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Areas of expertise</label>
                                <input
                                    name="expertise"
                                    defaultValue={(fellow.expertise || []).join(', ')}
                                    placeholder="e.g. Agronomy, Supply chains, Fundraising (comma-separated)"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Country</label>
                                <input name="country" defaultValue={fellow.country || ''} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>City</label>
                                <input name="city" defaultValue={fellow.city || ''} className={inputClass} />
                            </div>
                        </div>
                    </section>

                    {/* Links */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-1">
                            <Link2 className="w-4 h-4 text-[#0B2C24]" /> Social media &amp; links
                        </h2>
                        <p className="text-xs text-gray-400 mb-5">
                            Add any you use — they appear as buttons on your public profile.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>LinkedIn</label>
                                <input name="linkedin_url" type="url" defaultValue={fellow.linkedin_url || ''} placeholder="https://linkedin.com/in/…" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>X / Twitter</label>
                                <input name="twitter_url" type="url" defaultValue={fellow.twitter_url || ''} placeholder="https://x.com/…" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Instagram</label>
                                <input name="instagram_url" type="url" defaultValue={fellow.instagram_url || ''} placeholder="https://instagram.com/…" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Facebook</label>
                                <input name="facebook_url" type="url" defaultValue={fellow.facebook_url || ''} placeholder="https://facebook.com/…" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>YouTube</label>
                                <input name="youtube_url" type="url" defaultValue={fellow.youtube_url || ''} placeholder="https://youtube.com/@…" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>TikTok</label>
                                <input name="tiktok_url" type="url" defaultValue={fellow.tiktok_url || ''} placeholder="https://tiktok.com/@…" className={inputClass} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Personal website</label>
                                <input name="website_url" type="url" defaultValue={fellow.website_url || ''} placeholder="https://…" className={inputClass} />
                            </div>
                        </div>
                    </section>

                    {/* Business */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                                <Briefcase className="w-4 h-4 text-[#0B2C24]" /> Your business
                            </h2>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="has_business"
                                    checked={hasBusiness}
                                    onChange={(e) => setHasBusiness(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#0B2C24] focus:ring-[#0B2C24]"
                                />
                                I run a business
                            </label>
                        </div>
                        {hasBusiness && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Business name</label>
                                    <input name="business_name" defaultValue={fellow.business_name || ''} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Sector</label>
                                    <input name="business_sector" defaultValue={fellow.business_sector || ''} placeholder="e.g. Agri-processing" className={inputClass} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>What the business does</label>
                                    <textarea name="business_description" defaultValue={fellow.business_description || ''} rows={3} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Stage</label>
                                    <select name="business_stage" defaultValue={fellow.business_stage || ''} className={inputClass}>
                                        <option value="">Select stage…</option>
                                        <option value="idea">Idea</option>
                                        <option value="early">Early stage</option>
                                        <option value="growth">Growth</option>
                                        <option value="established">Established</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Business website</label>
                                    <input name="business_website" type="url" defaultValue={fellow.business_website || ''} placeholder="https://…" className={inputClass} />
                                </div>
                            </div>
                        )}
                        {!hasBusiness && (
                            <p className="text-sm text-gray-500">
                                Tick the box if you run a business and want it on your fellow profile.
                            </p>
                        )}
                    </section>

                    {/* Visibility + save */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#0B2C24] focus:ring-[#0B2C24]"
                            />
                            <span className="flex items-center gap-1.5">
                                {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                Show my profile on the public fellows directory
                            </span>
                        </label>
                        <button
                            type="submit"
                            disabled={isPending || uploadingPhoto}
                            className="px-6 py-2.5 rounded-full bg-[#0B2C24] text-white text-sm font-semibold hover:bg-[#10392f] disabled:opacity-60 transition-colors"
                        >
                            {isPending ? 'Saving…' : 'Save profile'}
                        </button>
                    </div>
                </form>

                {/* Sidebar: Knowledge Hub contributions */}
                <aside className="space-y-6">
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-4">
                            <BookOpen className="w-4 h-4 text-[#0B2C24]" /> Knowledge Hub
                        </h2>
                        {contributions.length === 0 ? (
                            <div className="text-sm text-gray-500">
                                <p className="mb-3">No contributions yet.</p>
                                <Link
                                    href="/knowledgehub/contributors"
                                    className="text-[#0B2C24] font-medium hover:underline"
                                >
                                    Share your first insight →
                                </Link>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {contributions.map((c) => (
                                    <li key={c._id} className="text-sm">
                                        {c.status === 'published' && c.linkedInsight?.slug ? (
                                            <Link
                                                href={`/knowledgehub/insights/${c.linkedInsight.slug}`}
                                                className="font-medium text-gray-900 hover:text-[#0B2C24] hover:underline"
                                            >
                                                {c.title}
                                            </Link>
                                        ) : (
                                            <span className="font-medium text-gray-900">{c.title}</span>
                                        )}
                                        <span
                                            className={`ml-2 inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                                STATUS_BADGES[c.status] || 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {c.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-900">
                        <p className="font-semibold mb-1">Profile checklist</p>
                        <ul className="space-y-1.5">
                            <ChecklistItem done={!!photoUrl} label="Photo uploaded" />
                            <ChecklistItem done={!!fellow.bio} label="Bio written" />
                            <ChecklistItem done={(fellow.expertise || []).length > 0} label="Expertise added" />
                            <ChecklistItem done={!!fellow.role_in_agripro} label="AgriPro role set" />
                            <ChecklistItem done={contributions.length > 0} label="First Knowledge Hub contribution" />
                        </ul>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
    return (
        <li className="flex items-center gap-2">
            <CheckCircle className={`w-3.5 h-3.5 ${done ? 'text-green-600' : 'text-amber-300'}`} />
            <span className={done ? 'line-through opacity-70' : ''}>{label}</span>
        </li>
    );
}
