'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
    Store, ArrowLeft, Camera, Upload, CheckCircle, Loader2,
    Save, Globe, Phone, Mail, MapPin, Building2, Leaf, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import AIDescriptionBoost from '@/app/greenmarket/components/AIDescriptionBoost';

interface Vendor {
    id: string;
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
    business_type: string;
    product_description: string;
    sustainability_practices: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    website: string | null;
    country: string;
    region: string | null;
    city: string | null;
    address: string | null;
    onboarding_step: number;
    profile_completed: boolean;
}

const businessTypes = [
    { value: 'fresh-produce', label: 'Fresh Produce' },
    { value: 'livestock', label: 'Livestock & Poultry' },
    { value: 'grains', label: 'Grains & Cereals' },
    { value: 'processed-foods', label: 'Processed Foods' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'aquaculture', label: 'Fish & Aquaculture' },
    { value: 'eco-products', label: 'Eco-Friendly Products' },
    { value: 'farm-equipment', label: 'Farm Equipment' },
    { value: 'seeds', label: 'Seeds & Seedlings' },
    { value: 'agro-services', label: 'Agricultural Services' },
    { value: 'other', label: 'Other' },
];

export default function VendorProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        business_name: '',
        owner_name: '',
        email: '',
        phone: '',
        business_type: '',
        product_description: '',
        sustainability_practices: '',
        website: '',
        country: 'Ghana',
        region: '',
        city: '',
        address: ''
    });

    useEffect(() => {
        fetchVendorData();
    }, []);

    const fetchVendorData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/auth/login?redirectTo=/greenmarket/vendor-dashboard/profile');
            return;
        }

        const { data: vendorData, error } = await supabase
            .from('trade_vendors')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error || !vendorData) {
            router.push('/greenmarket/become-vendor');
            return;
        }

        setVendor(vendorData);
        setFormData({
            business_name: vendorData.business_name || '',
            owner_name: vendorData.owner_name || '',
            email: vendorData.email || '',
            phone: vendorData.phone || '',
            business_type: vendorData.business_type || '',
            product_description: vendorData.product_description || '',
            sustainability_practices: vendorData.sustainability_practices || '',
            website: vendorData.website || '',
            country: vendorData.country || 'Ghana',
            region: vendorData.region || '',
            city: vendorData.city || '',
            address: vendorData.address || ''
        });
        setLoading(false);
    };

    const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
        if (!vendor) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, or WebP image');
            return;
        }

        setError('');
        
        if (type === 'logo') {
            setUploadingLogo(true);
        } else {
            setUploadingCover(true);
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${vendor.id}/${type}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('vendor-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('vendor-images')
                .getPublicUrl(fileName);

            const updateField = type === 'logo' ? 'logo_url' : 'cover_image_url';
            
            const { error: updateError } = await supabase
                .from('trade_vendors')
                .update({ [updateField]: publicUrl })
                .eq('id', vendor.id);

            if (updateError) throw updateError;

            setVendor(prev => prev ? { ...prev, [updateField]: publicUrl } : null);
            setSuccess(`${type === 'logo' ? 'Logo' : 'Cover image'} updated successfully!`);
            
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload image');
        } finally {
            setUploadingLogo(false);
            setUploadingCover(false);
        }
    };

    const handleSave = async () => {
        if (!vendor) return;
        
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updates: any = {
                ...formData,
                sustainability_practices: formData.sustainability_practices || null,
                website: formData.website || null,
                region: formData.region || null,
                city: formData.city || null,
                address: formData.address || null,
                profile_completed: true,
                updated_at: new Date().toISOString()
            };

            // Update onboarding step if this is the first profile completion
            if (!vendor.profile_completed && vendor.onboarding_step === 2) {
                updates.onboarding_step = 3;
            }

            const { error: updateError } = await supabase
                .from('trade_vendors')
                .update(updates)
                .eq('id', vendor.id);

            if (updateError) throw updateError;

            setSuccess('Profile saved successfully!');
            
            // Refresh vendor data
            await fetchVendorData();

        } catch (err: any) {
            console.error('Save error:', err);
            setError(err.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (!vendor) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/greenmarket/vendor-dashboard"
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-green-600" />
                        Edit Vendor Profile
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Update your business information and branding
                    </p>
                </div>

                {/* Cover Image */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6"
                >
                    <div className="relative h-48 bg-gradient-to-r from-green-600 to-emerald-500">
                        {vendor.cover_image_url && (
                            <Image
                                src={vendor.cover_image_url}
                                alt="Cover"
                                fill
                                className="object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <label className="absolute bottom-4 right-4 cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors">
                                {uploadingCover ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                                Change Cover
                            </div>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                                disabled={uploadingCover}
                            />
                        </label>
                    </div>

                    {/* Logo */}
                    <div className="px-6 pb-6">
                        <div className="relative -mt-16 mb-4">
                            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
                                {vendor.logo_url ? (
                                    <Image
                                        src={vendor.logo_url}
                                        alt="Logo"
                                        width={128}
                                        height={128}
                                        className="object-cover"
                                    />
                                ) : (
                                    <Store className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 cursor-pointer">
                                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors shadow-lg">
                                    {uploadingLogo ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5" />
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                                    disabled={uploadingLogo}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500">
                            Upload a logo (recommended: 400x400px) and cover image (recommended: 1200x400px)
                        </p>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
                >
                    <div className="space-y-8">
                        {/* Business Information */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Store className="w-5 h-5 text-gray-400" />
                                Business Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.business_name}
                                        onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Owner Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.owner_name}
                                        onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Category *
                                    </label>
                                    <select
                                        value={formData.business_type}
                                        onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        {businessTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product/Service Description *
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.product_description}
                                    onChange={(e) => setFormData({ ...formData, product_description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Describe what you sell and what makes your products special..."
                                />
                                <AIDescriptionBoost
                                    businessName={formData.business_name}
                                    businessType={formData.business_type}
                                    city={formData.city}
                                    country={formData.country}
                                    currentDescription={formData.product_description}
                                    onApply={(improved) => setFormData({ ...formData, product_description: improved })}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-gray-400" />
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone *
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Region
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g. Greater Accra"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City/Town
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g. Accra"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Street address, landmark, etc."
                                />
                            </div>
                        </div>

                        {/* Sustainability */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Leaf className="w-5 h-5 text-gray-400" />
                                Sustainability Practices (Optional)
                            </h3>
                            <textarea
                                rows={3}
                                value={formData.sustainability_practices}
                                onChange={(e) => setFormData({ ...formData, sustainability_practices: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Tell buyers about your eco-friendly practices..."
                            />
                        </div>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                            <CheckCircle className="w-5 h-5" />
                            {success}
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Profile
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
