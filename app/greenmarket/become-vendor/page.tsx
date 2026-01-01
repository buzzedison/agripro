'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
    Store, ArrowRight, ArrowLeft, CheckCircle, Loader2,
    User, Mail, Phone, MapPin, Building2, Leaf, Globe,
    ShieldCheck, TrendingUp, Users, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
    {
        icon: Users,
        title: 'Reach Thousands',
        description: 'Connect with buyers across Africa'
    },
    {
        icon: ShieldCheck,
        title: 'Build Trust',
        description: 'Get verified and earn buyer confidence'
    },
    {
        icon: TrendingUp,
        title: 'Grow Sales',
        description: 'Expand your market reach'
    },
    {
        icon: Sparkles,
        title: 'Free to Start',
        description: 'No fees to become a vendor'
    }
];

const businessTypes = [
    { value: 'fresh-produce', label: 'Fresh Produce (Fruits, Vegetables, Herbs)' },
    { value: 'livestock', label: 'Livestock & Poultry' },
    { value: 'grains', label: 'Grains & Cereals' },
    { value: 'processed-foods', label: 'Processed Foods & Packaged Goods' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'aquaculture', label: 'Fish & Aquaculture' },
    { value: 'eco-products', label: 'Eco-Friendly Products' },
    { value: 'farm-equipment', label: 'Farm Equipment & Tools' },
    { value: 'seeds', label: 'Seeds & Seedlings' },
    { value: 'agro-services', label: 'Agricultural Services' },
    { value: 'other', label: 'Other' },
];

export default function BecomeVendorPage() {
    const router = useRouter();
    const supabase = createClient();
    
    const [user, setUser] = useState<any>(null);
    const [existingVendor, setExistingVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        businessType: '',
        productDescription: '',
        country: 'Ghana',
        region: '',
        city: ''
    });

    useEffect(() => {
        checkAuthAndVendor();
    }, []);

    const checkAuthAndVendor = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            router.push('/auth/login?redirectTo=/greenmarket/become-vendor');
            return;
        }
        
        setUser(user);
        
        // Pre-fill email from user
        setFormData(prev => ({ ...prev, email: user.email || '' }));
        
        // Check if user already has a vendor profile
        const { data: vendor } = await supabase
            .from('trade_vendors')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (vendor) {
            setExistingVendor(vendor);
            // Redirect to vendor dashboard if already a vendor
            router.push('/greenmarket/vendor-dashboard');
            return;
        }
        
        // Try to get profile info to pre-fill
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, country')
            .eq('id', user.id)
            .single();
        
        if (profile) {
            setFormData(prev => ({
                ...prev,
                ownerName: profile.full_name || '',
                country: profile.country || 'Ghana'
            }));
        }
        
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Create vendor profile - instant approval as basic vendor
            const { data: vendor, error: insertError } = await supabase
                .from('trade_vendors')
                .insert({
                    user_id: user.id,
                    business_name: formData.businessName,
                    owner_name: formData.ownerName,
                    email: formData.email,
                    phone: formData.phone,
                    business_type: formData.businessType,
                    product_description: formData.productDescription,
                    country: formData.country,
                    region: formData.region || null,
                    city: formData.city || null,
                    status: 'approved', // Instant approval
                    verification_level: 'basic',
                    onboarding_step: 2, // Move to step 2 (profile enhancement)
                    profile_completed: false,
                    onboarding_completed: false
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Redirect to vendor dashboard
            router.push('/greenmarket/vendor-dashboard?welcome=true');
            
        } catch (err: any) {
            console.error('Error creating vendor:', err);
            setError(err.message || 'Failed to create vendor profile. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link
                        href="/greenmarket"
                        className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Green Market
                    </Link>
                    <div className="max-w-2xl">
                        <motion.h1 
                            className="text-4xl md:text-5xl font-bold mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            Start Selling Today
                        </motion.h1>
                        <motion.p 
                            className="text-xl text-green-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Create your vendor profile in 2 minutes. No approval wait time - start listing products immediately!
                        </motion.p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Benefits Sidebar */}
                    <div className="lg:col-span-1 order-2 lg:order-1">
                        <div className="sticky top-24 space-y-6">
                            <h2 className="text-lg font-bold text-gray-900">Why Sell on Green Market?</h2>
                            
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <motion.div 
                                        key={index}
                                        className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <benefit.icon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                                            <p className="text-sm text-gray-600">{benefit.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" />
                                    Verification Levels
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5" />
                                        <div>
                                            <span className="font-medium text-gray-700">Basic Vendor</span>
                                            <p className="text-gray-600">Start selling immediately</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                                        <div>
                                            <span className="font-medium text-gray-700">Verified Vendor</span>
                                            <p className="text-gray-600">Upload ID for trust badge</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5" />
                                        <div>
                                            <span className="font-medium text-gray-700">Premium Vendor</span>
                                            <p className="text-gray-600">Full business verification</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <div className="lg:col-span-2 order-1 lg:order-2">
                        <motion.div 
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="p-6 border-b border-gray-100 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                        <Store className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Create Your Vendor Profile</h2>
                                        <p className="text-sm text-gray-600">Fill in the basics to get started</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                                {/* Business Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Business Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Business Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.businessName}
                                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Your business or farm name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Your Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.ownerName}
                                                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Your full name"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            What do you sell? *
                                        </label>
                                        <select
                                            required
                                            value={formData.businessType}
                                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Select category</option>
                                            {businessTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Brief Description *
                                        </label>
                                        <textarea
                                            required
                                            rows={3}
                                            value={formData.productDescription}
                                            onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="What products do you offer? What makes them special?"
                                        />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Contact Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="0XX XXX XXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
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
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Creating your store...
                                            </>
                                        ) : (
                                            <>
                                                <Store className="w-5 h-5" />
                                                Create My Vendor Profile
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-sm text-gray-500 mt-4">
                                        By creating a profile, you agree to our terms of service
                                    </p>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
