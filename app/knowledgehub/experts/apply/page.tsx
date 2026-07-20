'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import KnowledgeHubNavbar from '../../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../../components/KnowledgeHubFooter';
import Breadcrumb from '../../components/Breadcrumb';
import { onUrlBlur } from '@/lib/utils/url';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Award, 
  Clock, 
  FileText, 
  Upload,
  Check,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface FormData {
  applicantName: string;
  email: string;
  phone: string;
  professionalTitle: string;
  currentOrganization: string;
  primaryExpertise: string;
  otherExpertise: string;
  specializations: string[];
  yearsOfExperience: number;
  education: Array<{
    degree: string;
    institution: string;
    year: number;
    fieldOfStudy: string;
  }>;
  certifications: string[];
  workExperience: string;
  achievements: string[];
  whyJoin: string;
  contributions: string;
  availabilityForConsulting: boolean;
  preferredEngagementTypes: string[];
  languages: string[];
  location: {
    country: string;
    state: string;
    city: string;
  };
  socialProfiles: {
    linkedin: string;
    twitter: string;
    website: string;
    researchGate: string;
    googleScholar: string;
  };
  agreeToTerms: boolean;
}

export default function ExpertApplicationPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    applicantName: '',
    email: '',
    phone: '',
    professionalTitle: '',
    currentOrganization: '',
    primaryExpertise: '',
    otherExpertise: '',
    specializations: [],
    yearsOfExperience: 1,
    education: [{ degree: '', institution: '', year: new Date().getFullYear(), fieldOfStudy: '' }],
    certifications: [],
    workExperience: '',
    achievements: [],
    whyJoin: '',
    contributions: '',
    availabilityForConsulting: false,
    preferredEngagementTypes: [],
    languages: [],
    location: { country: '', state: '', city: '' },
    socialProfiles: {
      linkedin: '',
      twitter: '',
      website: '',
      researchGate: '',
      googleScholar: ''
    },
    agreeToTerms: false
  });

  const expertiseOptions = [
    'Agricultural Economics',
    'Crop Science',
    'Livestock Management',
    'AgTech & Innovation',
    'Sustainable Farming',
    'Market Analysis',
    'Soil Management',
    'Water Resource Management',
    'Organic Farming',
    'Farm Business Management',
    'Agricultural Policy',
    'Climate-Smart Agriculture',
    'Other (specify below)'
  ];

  const engagementTypes = [
    'One-time Consultation',
    'Ongoing Advisory',
    'Project-based Work',
    'Training & Workshops',
    'Farm Visits',
    'Remote Consultation',
    'Writing Articles/Content',
    'Speaking at Events'
  ];

  const totalSteps = 5;

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Auth error:', error);
          router.push('/auth/login?redirectTo=/knowledgehub/experts/apply');
          return;
        }
        
        if (!user) {
          router.push('/auth/login?redirectTo=/knowledgehub/experts/apply');
          return;
        }
        
        setUser(user);
        // Pre-fill email if available
        if (user.email) {
          setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
        router.push('/auth/login?redirectTo=/knowledgehub/experts/apply');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          router.push('/auth/login?redirectTo=/knowledgehub/experts/apply');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateNestedFormData = (parent: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [field]: value }
    }));
  };

  const addArrayItem = (field: keyof FormData, item: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), item]
    }));
  };

  const removeArrayItem = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof FormData, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => i === index ? value : item)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.applicantName.trim()) newErrors.applicantName = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.professionalTitle.trim()) newErrors.professionalTitle = 'Professional title is required';
        if (!formData.primaryExpertise) newErrors.primaryExpertise = 'Primary expertise is required';
        if (formData.yearsOfExperience < 1) newErrors.yearsOfExperience = 'Years of experience must be at least 1';
        break;

      case 2:
        if (!formData.education[0]?.degree) newErrors.education = 'At least one degree is required';
        if (!formData.education[0]?.institution) newErrors.education = 'Institution is required';
        if (formData.workExperience.length < 200) newErrors.workExperience = 'Work experience must be at least 200 characters';
        break;

      case 3:
        if (formData.whyJoin.length < 100) newErrors.whyJoin = 'Please provide at least 100 characters';
        if (formData.contributions.length < 100) newErrors.contributions = 'Please provide at least 100 characters';
        break;

      case 4:
        if (!formData.location.country) newErrors.location = 'Country is required';
        break;

      case 5:
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/expert-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
      } else {
        setErrors({ submit: result.error || 'Failed to submit application. Please try again.' });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <KnowledgeHubNavbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </main>
        <KnowledgeHubFooter />
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <KnowledgeHubNavbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your interest in joining our expert network. We&apos;ve received your application 
              and will review it within 5-7 business days.
            </p>
            <p className="text-gray-600 mb-8">
              You&apos;ll receive an email confirmation shortly, and we&apos;ll contact you with next steps.
            </p>
            <button
              onClick={() => router.push('/knowledgehub/experts')}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              View Current Experts
            </button>
          </div>
        </main>
        <KnowledgeHubFooter />
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal & Professional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(e) => updateFormData('applicantName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.applicantName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.applicantName && <p className="mt-1 text-sm text-red-600">{errors.applicantName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your.email@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Title *
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.professionalTitle}
                    onChange={(e) => updateFormData('professionalTitle', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.professionalTitle ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., Senior Agricultural Economist"
                  />
                </div>
                {errors.professionalTitle && <p className="mt-1 text-sm text-red-600">{errors.professionalTitle}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Organization/Company
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={formData.currentOrganization}
                    onChange={(e) => updateFormData('currentOrganization', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Your current employer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.yearsOfExperience}
                    onChange={(e) => updateFormData('yearsOfExperience', parseInt(e.target.value))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExperience}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Area of Expertise *
              </label>
              <select
                value={formData.primaryExpertise}
                onChange={(e) => updateFormData('primaryExpertise', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.primaryExpertise ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select your primary expertise</option>
                {expertiseOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.primaryExpertise && <p className="mt-1 text-sm text-red-600">{errors.primaryExpertise}</p>}
            </div>

            {formData.primaryExpertise === 'Other (specify below)' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify your expertise
                </label>
                <input
                  type="text"
                  value={formData.otherExpertise}
                  onChange={(e) => updateFormData('otherExpertise', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Describe your area of expertise"
                />
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Education & Experience</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Educational Background *
              </label>
              {formData.education.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Degree/Qualification *"
                      value={edu.degree}
                      onChange={(e) => updateArrayItem('education', index, { ...edu, degree: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Institution *"
                      value={edu.institution}
                      onChange={(e) => updateArrayItem('education', index, { ...edu, institution: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={edu.fieldOfStudy}
                      onChange={(e) => updateArrayItem('education', index, { ...edu, fieldOfStudy: e.target.value })}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Year Completed"
                      value={edu.year}
                      onChange={(e) => updateArrayItem('education', index, { ...edu, year: parseInt(e.target.value) })}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('education', index)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('education', { degree: '', institution: '', year: new Date().getFullYear(), fieldOfStudy: '' })}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                + Add Another Degree
              </button>
              {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Experience Summary *
              </label>
              <textarea
                value={formData.workExperience}
                onChange={(e) => updateFormData('workExperience', e.target.value)}
                rows={6}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.workExperience ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe your relevant work experience and accomplishments (minimum 200 characters)"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.workExperience.length}/200 minimum characters
              </p>
              {errors.workExperience && <p className="mt-1 text-sm text-red-600">{errors.workExperience}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Motivation & Contribution</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to join as an expert? *
              </label>
              <textarea
                value={formData.whyJoin}
                onChange={(e) => updateFormData('whyJoin', e.target.value)}
                rows={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.whyJoin ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Explain your motivation for joining our expert network (minimum 100 characters)"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.whyJoin.length}/100 minimum characters
              </p>
              {errors.whyJoin && <p className="mt-1 text-sm text-red-600">{errors.whyJoin}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How can you contribute to the agricultural community? *
              </label>
              <textarea
                value={formData.contributions}
                onChange={(e) => updateFormData('contributions', e.target.value)}
                rows={4}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.contributions ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe how you plan to contribute to the agricultural community (minimum 100 characters)"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.contributions.length}/100 minimum characters
              </p>
              {errors.contributions && <p className="mt-1 text-sm text-red-600">{errors.contributions}</p>}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.availabilityForConsulting}
                  onChange={(e) => updateFormData('availabilityForConsulting', e.target.checked)}
                  className="mr-3 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  I&apos;m interested in providing paid consulting services
                </span>
              </label>
            </div>

            {formData.availabilityForConsulting && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Types of Engagement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {engagementTypes.map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.preferredEngagementTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData('preferredEngagementTypes', [...formData.preferredEngagementTypes, type]);
                          } else {
                            updateFormData('preferredEngagementTypes', formData.preferredEngagementTypes.filter(t => t !== type));
                          }
                        }}
                        className="mr-2 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Location & Contact Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Location *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Country *"
                    value={formData.location.country}
                    onChange={(e) => updateNestedFormData('location', 'country', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="State/Province"
                    value={formData.location.state}
                    onChange={(e) => updateNestedFormData('location', 'state', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.location.city}
                    onChange={(e) => updateNestedFormData('location', 'city', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Social Media & Professional Profiles
              </label>
              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="LinkedIn Profile URL"
                  value={formData.socialProfiles.linkedin}
                  onChange={(e) => updateNestedFormData('socialProfiles', 'linkedin', e.target.value)}
                  onBlur={onUrlBlur((v) => updateNestedFormData('socialProfiles', 'linkedin', v))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="url"
                  placeholder="Personal/Company Website"
                  value={formData.socialProfiles.website}
                  onChange={(e) => updateNestedFormData('socialProfiles', 'website', e.target.value)}
                  onBlur={onUrlBlur((v) => updateNestedFormData('socialProfiles', 'website', v))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="url"
                  placeholder="ResearchGate Profile URL"
                  value={formData.socialProfiles.researchGate}
                  onChange={(e) => updateNestedFormData('socialProfiles', 'researchGate', e.target.value)}
                  onBlur={onUrlBlur((v) => updateNestedFormData('socialProfiles', 'researchGate', v))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="url"
                  placeholder="Google Scholar Profile URL"
                  value={formData.socialProfiles.googleScholar}
                  onChange={(e) => updateNestedFormData('socialProfiles', 'googleScholar', e.target.value)}
                  onBlur={onUrlBlur((v) => updateNestedFormData('socialProfiles', 'googleScholar', v))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Application Summary</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {formData.applicantName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Title:</strong> {formData.professionalTitle}</p>
                <p><strong>Expertise:</strong> {formData.primaryExpertise}</p>
                <p><strong>Experience:</strong> {formData.yearsOfExperience} years</p>
                <p><strong>Location:</strong> {[formData.location.city, formData.location.state, formData.location.country].filter(Boolean).join(', ')}</p>
                <p><strong>Available for Consulting:</strong> {formData.availabilityForConsulting ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="text-blue-600 mr-3 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Terms and Conditions</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    By submitting this application, you agree to our expert network terms and conditions, 
                    including maintaining professional standards and providing accurate information.
                  </p>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                      className={`mr-3 mt-0.5 text-green-600 focus:ring-green-500 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                    />
                    <span className="text-sm text-blue-800">
                      I agree to the terms and conditions and confirm that all information provided is accurate *
                    </span>
                  </label>
                  {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>}
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="text-red-600 mr-3" size={20} />
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <KnowledgeHubNavbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Knowledge Hub', href: '/knowledgehub' },
            { label: 'Experts', href: '/knowledgehub/experts' },
            { label: 'Apply', href: '/knowledgehub/experts/apply' }
          ]} 
        />

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Expert Application</h1>
              <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft size={20} className="mr-2" />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Next
                <ArrowRight size={20} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center px-6 py-2 font-medium rounded-lg transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </main>

      <KnowledgeHubFooter />
    </div>
  );
} 