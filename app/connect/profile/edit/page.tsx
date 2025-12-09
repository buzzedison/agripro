'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Loader2, Check, Camera, Youtube, X, Play } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const valueChains = [
    'Poultry', 'Vegetables', 'Grains & Cereals', 'Fruits', 'Dairy',
    'Livestock', 'Aquaculture', 'Cocoa', 'Coffee', 'Cashew',
    'Shea', 'Oil Palm', 'Cassava', 'Yam', 'Rice', 'Maize',
    'Soybean', 'Groundnut', 'Cotton', 'Other'
];

const countries = [
    'Ghana', 'Nigeria', 'Kenya', 'Tanzania', 'Uganda', 'Ethiopia',
    'South Africa', 'Côte d\'Ivoire', 'Senegal', 'Rwanda', 'Zambia',
    'Malawi', 'Mozambique', 'Zimbabwe', 'Cameroon', 'Other'
];

const scales = [
    { id: 'small', label: 'Small Scale' },
    { id: 'medium', label: 'Medium Scale' },
    { id: 'large', label: 'Large Scale' },
    { id: 'enterprise', label: 'Enterprise' },
];

const userTypes = [
    { id: 'farmer', label: 'Farmer / Producer' },
    { id: 'buyer', label: 'Buyer / Trader' },
    { id: 'expert', label: 'Expert / Advisor' },
    { id: 'service_provider', label: 'Service Provider' },
];

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

export default function EditProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    const [formData, setFormData] = useState({
        full_name: '',
        bio: '',
        user_type: '',
        organization_name: '',
        organization_role: '',
        country: '',
        region: '',
        city: '',
        value_chains: [] as string[],
        scale: '',
        years_experience: '',
        phone: '',
        whatsapp: '',
        website: '',
        linkedin: '',
        avatar_url: '',
        header_url: '',
        youtube_url: '',
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login?redirectTo=/connect/profile/edit');
            return;
        }
        setUser(user);
        await fetchProfile(user.id);
        setLoading(false);
    };

    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setFormData({
                full_name: data.full_name || '',
                bio: data.bio || '',
                user_type: data.user_type || '',
                organization_name: data.organization_name || '',
                organization_role: data.organization_role || '',
                country: data.country || '',
                region: data.region || '',
                city: data.city || '',
                value_chains: data.value_chains || [],
                scale: data.scale || '',
                years_experience: data.years_experience?.toString() || '',
                phone: data.phone || '',
                whatsapp: data.whatsapp || '',
                website: data.website || '',
                linkedin: data.linkedin || '',
                avatar_url: data.avatar_url || '',
                header_url: data.header_url || '',
                youtube_url: data.youtube_url || '',
            });
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingAvatar(true);
        setError(null);

        try {
            // Delete old avatar if exists
            if (formData.avatar_url) {
                const oldPath = formData.avatar_url.split('/').slice(-2).join('/');
                await supabase.storage.from('avatars').remove([oldPath]);
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
        } catch (err: any) {
            setError('Failed to upload image: ' + (err.message || 'Unknown error'));
        } finally {
            setUploadingAvatar(false);
        }
    };

    const removeAvatar = () => {
        setFormData(prev => ({ ...prev, avatar_url: '' }));
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingCover(true);
        setError(null);

        try {
            // Delete old cover if exists
            if (formData.header_url) {
                const oldPath = formData.header_url.split('/').slice(-2).join('/');
                await supabase.storage.from('covers').remove([oldPath]);
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/cover_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('covers')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('covers')
                .getPublicUrl(fileName);

            setFormData(prev => ({ ...prev, header_url: publicUrl }));
        } catch (err: any) {
            setError('Failed to upload cover photo: ' + (err.message || 'Unknown error'));
        } finally {
            setUploadingCover(false);
        }
    };

    const removeCover = () => {
        setFormData(prev => ({ ...prev, header_url: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);
        setSaved(false);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...formData,
                    years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
                    email: user.email,
                    profile_complete: true,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'id' });

            if (error) throw error;

            setSaved(true);
            toast.success('Profile saved successfully!', {
                description: 'Your changes have been saved.',
            });
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save profile');
            toast.error('Failed to save profile', {
                description: err.message || 'Please try again.',
            });
        } finally {
            setSaving(false);
        }
    };

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleValueChain = (chain: string) => {
        setFormData(prev => ({
            ...prev,
            value_chains: prev.value_chains.includes(chain)
                ? prev.value_chains.filter(c => c !== chain)
                : [...prev.value_chains, chain]
        }));
    };

    const youtubeVideoId = getYouTubeVideoId(formData.youtube_url);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" richColors closeButton />
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/connect/dashboard"
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : saved ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Profile Photo */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Photo</h2>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                {formData.avatar_url ? (
                                    <Image
                                        src={formData.avatar_url}
                                        alt="Avatar"
                                        width={96}
                                        height={96}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-gray-400">
                                        {formData.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {uploadingAvatar && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                className="hidden"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    <Camera className="w-4 h-4" />
                                    Upload Photo
                                </button>
                                {formData.avatar_url && (
                                    <button
                                        type="button"
                                        onClick={removeAvatar}
                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                JPG, PNG or GIF. Max 5MB.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Cover Photo */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Cover Photo</h2>
                    <p className="text-sm text-gray-500 mb-4">Add a banner image for your profile (recommended: 1500x500px)</p>

                    <div className="relative">
                        <div className="w-full h-40 rounded-xl bg-gradient-to-r from-green-100 to-green-50 flex items-center justify-center overflow-hidden border border-gray-200">
                            {formData.header_url ? (
                                <Image
                                    src={formData.header_url}
                                    alt="Cover"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Camera className="w-8 h-8 mx-auto mb-2" />
                                    <span className="text-sm">No cover photo</span>
                                </div>
                            )}
                            {uploadingCover && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleCoverUpload}
                                className="hidden"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => coverInputRef.current?.click()}
                                    disabled={uploadingCover}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                >
                                    <Camera className="w-4 h-4" />
                                    {formData.header_url ? 'Change Cover' : 'Upload Cover'}
                                </button>
                                {formData.header_url && (
                                    <button
                                        type="button"
                                        onClick={removeCover}
                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                JPG, PNG or GIF. Max 5MB. Recommended size: 1500x500 pixels.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Video Introduction */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Video Introduction</h2>
                    <p className="text-sm text-gray-500 mb-4">Add a YouTube link to introduce yourself (optional)</p>

                    <div className="flex items-center gap-3">
                        <Youtube className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <input
                            type="url"
                            value={formData.youtube_url}
                            onChange={(e) => updateField('youtube_url', e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* YouTube Preview */}
                    {youtubeVideoId && (
                        <div className="mt-4">
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                                <iframe
                                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                    title="Video introduction"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* Basic Info */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => updateField('full_name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => updateField('bio', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User Type *</label>
                            <select
                                value={formData.user_type}
                                onChange={(e) => updateField('user_type', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select type</option>
                                {userTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
                            <input
                                type="number"
                                value={formData.years_experience}
                                onChange={(e) => updateField('years_experience', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                            <input
                                type="text"
                                value={formData.organization_name}
                                onChange={(e) => updateField('organization_name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input
                                type="text"
                                value={formData.organization_role}
                                onChange={(e) => updateField('organization_role', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Location</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                            <select
                                value={formData.country}
                                onChange={(e) => updateField('country', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select country</option>
                                {countries.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Region/State</label>
                            <input
                                type="text"
                                value={formData.region}
                                onChange={(e) => updateField('region', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => updateField('city', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </section>

                {/* Value Chains */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Value Chains</h2>

                    <div className="flex flex-wrap gap-2">
                        {valueChains.map((chain) => (
                            <button
                                key={chain}
                                type="button"
                                onClick={() => toggleValueChain(chain)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.value_chains.includes(chain)
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {chain}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scale of Operations</label>
                        <select
                            value={formData.scale}
                            onChange={(e) => updateField('scale', e.target.value)}
                            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">Select scale</option>
                            {scales.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="+233..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                            <input
                                type="tel"
                                value={formData.whatsapp}
                                onChange={(e) => updateField('whatsapp', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="+233..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => updateField('website', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                            <input
                                type="url"
                                value={formData.linkedin}
                                onChange={(e) => updateField('linkedin', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <Link
                        href="/connect/dashboard"
                        className="px-6 py-2.5 text-gray-600 font-medium hover:text-gray-800"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
