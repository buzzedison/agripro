'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, ShoppingBag, Lightbulb, Wrench,
    ArrowRight, ArrowLeft, Check, MapPin,
    Briefcase, Phone, Globe, Loader2
} from 'lucide-react';
import Link from 'next/link';

const userTypes = [
    { id: 'farmer', title: 'Farmer / Producer', description: 'I grow or produce agricultural products', icon: Users, color: 'green' },
    { id: 'buyer', title: 'Buyer / Trader', description: 'I purchase agricultural products', icon: ShoppingBag, color: 'blue' },
    { id: 'expert', title: 'Expert / Advisor', description: 'I provide advisory or consulting services', icon: Lightbulb, color: 'amber' },
    { id: 'service_provider', title: 'Service Provider', description: 'I offer services to the ag sector', icon: Wrench, color: 'purple' },
];

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
    { id: 'small', label: 'Small Scale', description: 'Local / subsistence level' },
    { id: 'medium', label: 'Medium Scale', description: 'Regional reach' },
    { id: 'large', label: 'Large Scale', description: 'National / multi-regional' },
    { id: 'enterprise', label: 'Enterprise', description: 'International operations' },
];

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [formData, setFormData] = useState({
        user_type: searchParams.get('type') || '',
        full_name: '',
        bio: '',
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
    });

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login?redirectTo=/connect/onboarding');
            return;
        }
        setUser(user);
        setFormData(prev => ({ ...prev, full_name: user.user_metadata?.full_name || '' }));
        setCheckingAuth(false);
    };

    const handleSubmit = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const profileData = {
                id: user.id,
                full_name: formData.full_name,
                bio: formData.bio,
                user_type: formData.user_type,
                organization_name: formData.organization_name || null,
                organization_role: formData.organization_role || null,
                country: formData.country,
                region: formData.region || null,
                city: formData.city || null,
                value_chains: formData.value_chains,
                scale: formData.scale || null,
                years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
                phone: formData.phone || null,
                whatsapp: formData.whatsapp || null,
                website: formData.website || null,
                linkedin: formData.linkedin || null,
                email: user.email,
                is_public: true,
                profile_complete: true,
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(profileData, { onConflict: 'id' });

            if (error) throw error;

            router.push('/connect/directory?welcome=true');
        } catch (err: any) {
            console.error('Error creating profile:', err);
            setError(err.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (field: string, value: any) => {
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

    const canProceed = () => {
        switch (step) {
            case 1: return formData.user_type !== '';
            case 2: return formData.full_name.trim() !== '' && formData.country !== '';
            case 3: return formData.value_chains.length > 0;
            case 4: return true;
            default: return false;
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
                        <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% complete</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-green-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 4) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <AnimatePresence mode="wait">
                        {/* Step 1: User Type */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AgriPro Connect!</h2>
                                <p className="text-gray-600 mb-8">First, tell us your role in the agricultural value chain.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {userTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => updateFormData('user_type', type.id)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.user_type === type.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-green-300'
                                                }`}
                                        >
                                            <type.icon className={`w-8 h-8 mb-2 ${formData.user_type === type.id ? 'text-green-600' : 'text-gray-400'}`} />
                                            <h3 className="font-semibold text-gray-900">{type.title}</h3>
                                            <p className="text-sm text-gray-500">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Basic Info */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
                                <p className="text-gray-600 mb-8">This information will appear on your public profile.</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => updateFormData('full_name', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => updateFormData('bio', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="Tell us about yourself and your work in agriculture..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                                            <input
                                                type="text"
                                                value={formData.organization_name}
                                                onChange={(e) => updateFormData('organization_name', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="Company or farm name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
                                            <input
                                                type="text"
                                                value={formData.organization_role}
                                                onChange={(e) => updateFormData('organization_role', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="e.g., Owner, Manager"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                        <select
                                            value={formData.country}
                                            onChange={(e) => updateFormData('country', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        >
                                            <option value="">Select your country</option>
                                            {countries.map((country) => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Region/State</label>
                                            <input
                                                type="text"
                                                value={formData.region}
                                                onChange={(e) => updateFormData('region', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="e.g., Greater Accra"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => updateFormData('city', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                placeholder="e.g., Accra"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Agriculture Details */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Agricultural Focus</h2>
                                <p className="text-gray-600 mb-8">Select the value chains you work with.</p>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Value Chains *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {valueChains.map((chain) => (
                                                <button
                                                    key={chain}
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
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Scale of Operations</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {scales.map((scale) => (
                                                <button
                                                    key={scale.id}
                                                    onClick={() => updateFormData('scale', scale.id)}
                                                    className={`p-3 rounded-lg border-2 text-left transition-all ${formData.scale === scale.id
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200 hover:border-green-300'
                                                        }`}
                                                >
                                                    <span className="font-medium text-gray-900">{scale.label}</span>
                                                    <p className="text-xs text-gray-500">{scale.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                        <input
                                            type="number"
                                            value={formData.years_experience}
                                            onChange={(e) => updateFormData('years_experience', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="e.g., 5"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Contact Info */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h2>
                                <p className="text-gray-600 mb-8">How can people reach you? (All optional)</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => updateFormData('phone', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="+233 XX XXX XXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            WhatsApp Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.whatsapp}
                                            onChange={(e) => updateFormData('whatsapp', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="+233 XX XXX XXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Globe className="w-4 h-4 inline mr-2" />
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => updateFormData('website', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="https://yourwebsite.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            LinkedIn Profile
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.linkedin}
                                            onChange={(e) => updateFormData('linkedin', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="https://linkedin.com/in/yourprofile"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="mt-8 flex justify-between">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back
                            </button>
                        ) : (
                            <Link
                                href="/connect"
                                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Cancel
                            </Link>
                        )}

                        {step < 4 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Continue
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating Profile...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        Complete Profile
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
