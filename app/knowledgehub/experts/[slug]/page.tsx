'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { client } from '../../../lib/client';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import KnowledgeHubNavbar from '../../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../../components/KnowledgeHubFooter';
import Breadcrumb from '../../components/Breadcrumb';
import { 
  MapPin, 
  Star, 
  Clock, 
  Award, 
  Mail, 
  Linkedin, 
  Globe, 
  Users,
  MessageCircle,
  CheckCircle,
  GraduationCap,
  Briefcase,
  Trophy,
  Languages,
  Calendar,
  DollarSign,
  Phone
} from 'lucide-react';

interface Expert {
  _id: string;
  name: string;
  slug: { current: string };
  title: string;
  expertise: string;
  specializations?: string[];
  bio: string;
  image: any;
  yearsOfExperience: number;
  education?: Array<{
    degree: string;
    institution: string;
    year?: number;
    fieldOfStudy?: string;
  }>;
  certifications?: string[];
  achievements?: string[];
  languages?: string[];
  availableForConsulting: boolean;
  consultingRates?: {
    hourlyRate?: number;
    minimumEngagement?: string;
    preferredEngagementTypes?: string[];
  };
  contact: {
    email: string;
    phone?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  location: {
    country: string;
    state?: string;
    city?: string;
  };
  featured: boolean;
  joinedAt?: string;
}

export default function ExpertProfilePage() {
  const params = useParams();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchExpert(params.slug as string);
    }
  }, [params.slug]);

  const fetchExpert = async (slug: string) => {
    try {
      const query = `*[_type == "expert" && slug.current == $slug && status == "active"][0] {
        _id,
        name,
        slug,
        title,
        expertise,
        specializations,
        bio,
        image,
        yearsOfExperience,
        education,
        certifications,
        achievements,
        languages,
        availableForConsulting,
        consultingRates,
        contact,
        location,
        featured,
        joinedAt
      }`;
      
      const data = await client.fetch(query, { slug });
      setExpert(data);
    } catch (error) {
      console.error('Error fetching expert:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationString = (location: Expert['location']) => {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  };

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Member since 2024';
    return `Member since ${new Date(dateString).getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <KnowledgeHubNavbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <KnowledgeHubFooter />
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-gray-50">
        <KnowledgeHubNavbar />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Expert Not Found</h1>
            <p className="text-gray-600 mb-6">
              The expert profile you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/knowledgehub/experts"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              View All Experts
            </Link>
          </div>
        </main>
        <KnowledgeHubFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KnowledgeHubNavbar />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Knowledge Hub', href: '/knowledgehub' },
            { label: 'Experts', href: '/knowledgehub/experts' },
            { label: expert.name, href: `/knowledgehub/experts/${expert.slug.current}` }
          ]} 
        />

        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white/20 border-4 border-white/30">
                  {expert.image && (
                    <Image
                      src={urlForImage(expert.image).url()}
                      alt={expert.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {expert.featured && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Star size={16} className="text-yellow-900" />
                  </div>
                )}
                {expert.availableForConsulting && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle size={16} className="text-green-600" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{expert.name}</h1>
                <p className="text-xl opacity-90 mb-2">{expert.title}</p>
                <p className="text-lg opacity-80 mb-4">{expert.expertise}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {expert.yearsOfExperience} years experience
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1" />
                    {getLocationString(expert.location)}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-1" />
                    {formatJoinDate(expert.joinedAt)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Contact Expert
                </button>
                
                {expert.availableForConsulting && (
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm">
                      <CheckCircle size={14} className="mr-1" />
                      Available for Consulting
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {expert.bio}
              </p>
            </div>

            {/* Specializations */}
            {expert.specializations && expert.specializations.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {expert.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {expert.education && expert.education.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="mr-2" />
                  Education
                </h2>
                <div className="space-y-4">
                  {expert.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-lg">{edu.degree}</h3>
                      <p className="text-green-600 font-medium">{edu.institution}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        {edu.year && <span>{edu.year}</span>}
                        {edu.fieldOfStudy && <span>{edu.fieldOfStudy}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {expert.achievements && expert.achievements.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Trophy className="mr-2" />
                  Key Achievements
                </h2>
                <div className="space-y-3">
                  {expert.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start">
                      <Award className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={20} />
                      <p className="text-gray-700">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Consulting Information */}
            {expert.availableForConsulting && expert.consultingRates && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="mr-2" />
                  Consulting Services
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {expert.consultingRates.hourlyRate && (
                    <div className="flex items-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="text-green-600 mr-3" size={24} />
                      <div>
                        <p className="font-semibold text-gray-900">Hourly Rate</p>
                        <p className="text-green-600 font-bold">${expert.consultingRates.hourlyRate}/hour</p>
                      </div>
                    </div>
                  )}
                  
                  {expert.consultingRates.minimumEngagement && (
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="text-blue-600 mr-3" size={24} />
                      <div>
                        <p className="font-semibold text-gray-900">Minimum Engagement</p>
                        <p className="text-blue-600 font-bold">{expert.consultingRates.minimumEngagement}</p>
                      </div>
                    </div>
                  )}
                </div>

                {expert.consultingRates.preferredEngagementTypes && expert.consultingRates.preferredEngagementTypes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Preferred Engagement Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.consultingRates.preferredEngagementTypes.map((type, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-3">
                <a
                  href={`mailto:${expert.contact.email}`}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Mail className="text-gray-600 mr-3" size={20} />
                  <span className="text-gray-700">{expert.contact.email}</span>
                </a>

                {expert.contact.phone && (
                  <a
                    href={`tel:${expert.contact.phone}`}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="text-gray-600 mr-3" size={20} />
                    <span className="text-gray-700">{expert.contact.phone}</span>
                  </a>
                )}

                {expert.contact.linkedin && (
                  <a
                    href={expert.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Linkedin className="text-blue-600 mr-3" size={20} />
                    <span className="text-gray-700">LinkedIn Profile</span>
                  </a>
                )}

                {expert.contact.website && (
                  <a
                    href={expert.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="text-gray-600 mr-3" size={20} />
                    <span className="text-gray-700">Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <MapPin className="mr-2" size={16} />
                    Location
                  </h4>
                  <p className="text-gray-700">{getLocationString(expert.location)}</p>
                </div>

                {expert.languages && expert.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Languages className="mr-2" size={16} />
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {expert.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {expert.certifications && expert.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Award className="mr-2" size={16} />
                      Certifications
                    </h4>
                    <div className="space-y-1">
                      {expert.certifications.map((cert, index) => (
                        <p key={index} className="text-gray-700 text-sm">{cert}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Badge */}
            {expert.featured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white text-center">
                <Star size={32} className="mx-auto mb-2" />
                <h3 className="font-bold text-lg mb-2">Featured Expert</h3>
                <p className="text-sm opacity-90">
                  This expert has been recognized for outstanding contributions to the agricultural community.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact {expert.name}</h3>
              <p className="text-gray-600 mb-4">
                You can reach out to {expert.name} directly using their contact information, or send them an email.
              </p>
              
              <div className="space-y-3 mb-6">
                <a
                  href={`mailto:${expert.contact.email}?subject=Inquiry from AgriPro Knowledge Hub`}
                  className="flex items-center w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Mail className="mr-3" size={20} />
                  Send Email
                </a>
                
                {expert.contact.linkedin && (
                  <a
                    href={expert.contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Linkedin className="mr-3" size={20} />
                    Contact on LinkedIn
                  </a>
                )}
              </div>
              
              <button
                onClick={() => setShowContactForm(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>

      <KnowledgeHubFooter />
    </div>
  );
} 