'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus, RefreshCw, Loader2, CheckCircle, AlertCircle, X,
    Calendar, Trash2, Edit2, ExternalLink, Eye, EyeOff, Star, Upload,
} from 'lucide-react';
import { DEFAULT_WEBINAR, slugifyTitle, formatWebinarDate, formatWebinarTime, type CatalystWebinar } from '@/lib/catalyst-w/webinars';

interface Toast {
    id: string;
    type: 'success' | 'error';
    message: string;
}

type FormData = {
    slug: string;
    title: string;
    subtitle: string;
    summary: string;
    body_content: string;
    starts_at: string;
    timezone: string;
    duration_minutes: number;
    format: 'online' | 'in_person' | 'hybrid';
    venue: string;
    cost: string;
    registration_url: string;
    image_url: string;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    featured: boolean;
    meta_description: string;
};

const EMPTY_FORM: FormData = {
    slug: '',
    title: '',
    subtitle: '',
    summary: '',
    body_content: '',
    starts_at: '',
    timezone: 'Africa/Lagos',
    duration_minutes: 75,
    format: 'online',
    venue: '',
    cost: 'Free',
    registration_url: '',
    image_url: '',
    status: 'draft',
    featured: false,
    meta_description: '',
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
    completed: 'bg-blue-100 text-blue-700',
};

function ToastBar({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                        t.type === 'success' ? 'bg-green-700 text-white' : 'bg-red-600 text-white'
                    }`}
                >
                    {t.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{t.message}</span>
                    <button onClick={() => remove(t.id)}><X className="w-3.5 h-3.5 opacity-70" /></button>
                </div>
            ))}
        </div>
    );
}

export default function CatalystWWebinarsAdminPage() {
    const [webinars, setWebinars] = useState<CatalystWebinar[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editing, setEditing] = useState<CatalystWebinar | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    const addToast = (type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(p => [...p, { id, type, message }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
    };

    const fetchWebinars = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/catalyst-w/webinars');
            if (!res.ok) throw new Error('Failed to fetch');
            setWebinars(await res.json());
        } catch {
            addToast('error', 'Could not load webinars');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchWebinars(); }, [fetchWebinars]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const loadDefaultTemplate = () => {
        setForm(f => ({
            ...f,
            title: DEFAULT_WEBINAR.title,
            subtitle: DEFAULT_WEBINAR.subtitle,
            summary: DEFAULT_WEBINAR.summary,
            body_content: DEFAULT_WEBINAR.bodyContent,
            meta_description: DEFAULT_WEBINAR.metaDescription,
            duration_minutes: DEFAULT_WEBINAR.durationMinutes,
            cost: DEFAULT_WEBINAR.cost,
            format: DEFAULT_WEBINAR.format,
            slug: f.slug || slugifyTitle(DEFAULT_WEBINAR.title),
        }));
    };

    const openEdit = (w: CatalystWebinar) => {
        setEditing(w);
        setForm({
            slug: w.slug,
            title: w.title,
            subtitle: w.subtitle ?? '',
            summary: w.summary ?? '',
            body_content: w.body_content ?? '',
            starts_at: w.starts_at ? new Date(w.starts_at).toISOString().slice(0, 16) : '',
            timezone: w.timezone,
            duration_minutes: w.duration_minutes,
            format: w.format,
            venue: w.venue ?? '',
            cost: w.cost,
            registration_url: w.registration_url ?? '',
            image_url: w.image_url ?? '',
            status: w.status,
            featured: w.featured,
            meta_description: w.meta_description ?? '',
        });
        setShowForm(true);
    };

    const handleTitleChange = (title: string) => {
        setForm(f => ({
            ...f,
            title,
            slug: editing ? f.slug : slugifyTitle(title),
        }));
    };

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/admin/catalyst-w/webinars/upload', { method: 'POST', body: fd });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? 'Upload failed');
            }
            const { url } = await res.json();
            setForm(f => ({ ...f, image_url: url }));
            addToast('success', 'Image uploaded');
        } catch (err: any) {
            addToast('error', err.message ?? 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.slug || !form.starts_at) {
            addToast('error', 'Title, slug, and date/time are required');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                starts_at: new Date(form.starts_at).toISOString(),
                venue: form.venue || null,
                registration_url: form.registration_url || null,
                image_url: form.image_url || null,
            };

            const res = await fetch('/api/admin/catalyst-w/webinars', {
                method: editing ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? 'Save failed');
            }

            addToast('success', editing ? 'Webinar updated' : 'Webinar created');
            setShowForm(false);
            setEditing(null);
            fetchWebinars();
        } catch (err: any) {
            addToast('error', err.message ?? 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/catalyst-w/webinars?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            addToast('success', 'Webinar deleted');
            if (editing?.id === id) setShowForm(false);
            fetchWebinars();
        } catch {
            addToast('error', 'Failed to delete');
        } finally {
            setDeleting(null);
        }
    };

    const togglePublish = async (w: CatalystWebinar) => {
        const newStatus = w.status === 'published' ? 'draft' : 'published';
        try {
            const res = await fetch('/api/admin/catalyst-w/webinars', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: w.id, status: newStatus }),
            });
            if (!res.ok) throw new Error('Update failed');
            addToast('success', newStatus === 'published' ? 'Published' : 'Unpublished');
            fetchWebinars();
        } catch {
            addToast('error', 'Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-[#0B2C24] text-white px-6 py-8">
                <div className="max-w-5xl mx-auto">
                    <Link href="/admin/catalyst-w" className="text-green-300 hover:text-white text-sm mb-4 inline-block">
                        ← Back to Accelerator
                    </Link>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-black">Webinars & Events</h1>
                            <p className="text-white/60 text-sm mt-1">Manage public events on the Woman Year page</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={fetchWebinars} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                                <RefreshCw size={14} /> Refresh
                            </button>
                            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#F4C430] text-[#0B2C24] font-bold rounded-lg text-sm">
                                <Plus size={14} /> Add Webinar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin" /> Loading…
                    </div>
                ) : webinars.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 mb-4">No webinars yet.</p>
                        <button onClick={openCreate} className="px-5 py-2.5 bg-[#0B2C24] text-white rounded-lg text-sm font-medium">
                            Create your first webinar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {webinars.map(w => (
                            <div key={w.id} className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[w.status]}`}>
                                            {w.status}
                                        </span>
                                        {w.featured && (
                                            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                                <Star size={12} className="fill-amber-400" /> Featured
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-900 truncate">{w.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                        <Calendar size={13} />
                                        {formatWebinarDate(w.starts_at, w.timezone)} · {formatWebinarTime(w.starts_at, w.timezone)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {w.status === 'published' && (
                                        <a
                                            href={`/webinars/${w.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-[#0B2C24] rounded-lg hover:bg-gray-50"
                                            title="View public page"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => togglePublish(w)}
                                        className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                                        title={w.status === 'published' ? 'Unpublish' : 'Publish'}
                                    >
                                        {w.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button onClick={() => openEdit(w)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(w.id, w.title)}
                                        disabled={deleting === w.id}
                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {deleting === w.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="font-bold text-lg">{editing ? 'Edit Webinar' : 'New Webinar'}</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            {!editing && (
                                <button
                                    type="button"
                                    onClick={loadDefaultTemplate}
                                    className="w-full py-2.5 border-2 border-dashed border-[#F4C430] text-[#0B2C24] text-sm font-medium rounded-lg hover:bg-[#F4C430]/10"
                                >
                                    Load default Catalyst W webinar copy
                                </button>
                            )}

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title *</label>
                                    <input
                                        value={form.title}
                                        onChange={e => handleTitleChange(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Slug *</label>
                                    <input
                                        value={form.slug}
                                        onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm(f => ({ ...f, status: e.target.value as FormData['status'] }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Subtitle</label>
                                    <input
                                        value={form.subtitle}
                                        onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Summary (card preview)</label>
                                    <textarea
                                        value={form.summary}
                                        onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.starts_at}
                                        onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Timezone</label>
                                    <input
                                        value={form.timezone}
                                        onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                                        placeholder="Africa/Lagos"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={form.duration_minutes}
                                        onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cost</label>
                                    <input
                                        value={form.cost}
                                        onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Format</label>
                                    <select
                                        value={form.format}
                                        onChange={e => setForm(f => ({ ...f, format: e.target.value as FormData['format'] }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    >
                                        <option value="online">Online</option>
                                        <option value="in_person">In Person</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Venue (optional)</label>
                                    <input
                                        value={form.venue}
                                        onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                                        placeholder="Online / Zoom / Address"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Cover Image</label>
                                    {form.image_url && (
                                        <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 border border-gray-200 max-w-md">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={form.image_url} alt="Cover preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                                                className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg cursor-pointer transition-colors">
                                            {uploadingImage ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Upload size={16} />
                                            )}
                                            {uploadingImage ? 'Uploading…' : 'Upload image'}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                className="hidden"
                                                disabled={uploadingImage}
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(file);
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                        <span className="text-xs text-gray-400">or paste URL below · max 5 MB</span>
                                    </div>
                                    <input
                                        type="url"
                                        value={form.image_url}
                                        onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                        placeholder="https://…"
                                        className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Registration URL</label>
                                    <input
                                        type="url"
                                        value={form.registration_url}
                                        onChange={e => setForm(f => ({ ...f, registration_url: e.target.value }))}
                                        placeholder="https://zoom.us/... or Google Form link"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full page content</label>
                                    <textarea
                                        value={form.body_content}
                                        onChange={e => setForm(f => ({ ...f, body_content: e.target.value }))}
                                        rows={12}
                                        placeholder="Use ## for section headings, ### for subheadings, - for bullet lists"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 font-mono text-xs resize-y"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Meta description (SEO)</label>
                                    <textarea
                                        value={form.meta_description}
                                        onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 resize-none"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.featured}
                                            onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        Feature on Woman Year page
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-[#0B2C24] text-white text-sm font-medium rounded-lg disabled:opacity-50"
                            >
                                {saving && <Loader2 size={14} className="animate-spin" />}
                                {editing ? 'Save changes' : 'Create webinar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastBar toasts={toasts} remove={id => setToasts(p => p.filter(t => t.id !== id))} />
        </div>
    );
}
