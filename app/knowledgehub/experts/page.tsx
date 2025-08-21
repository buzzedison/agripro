'use client';

import { useState, useEffect } from 'react';
import { client } from '../../lib/client';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import KnowledgeHubNavbar from '../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../components/KnowledgeHubFooter';
import Breadcrumb from '../components/Breadcrumb';
import { 
  MapPin, 
  Star, 
  Clock, 
  Award, 
  Users, 
  MessageCircle, 
  Filter,
  Search,
  ChevronDown,
  ExternalLink,
  Mail,
  Linkedin,
  Globe,
  Plus
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
  availableForConsulting: boolean;
  consultingRates?: {
    hourlyRate?: number;
    preferredEngagementTypes?: string[];
  };
  contact: {
    email: string;
    linkedin?: string;
    website?: string;
  };
  location: {
    country: string;
    state?: string;
    city?: string;
  };
  languages?: string[];
  featured: boolean;
  status: string;
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [consultingOnly, setConsultingOnly] = useState(false);

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
    'Climate-Smart Agriculture'
  ];

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const query = `*[_type == "expert" && status == "active"] | order(featured desc, name asc) {
        _id,
        name,
        slug,
        title,
        expertise,
        specializations,
        bio,
        image,
        yearsOfExperience,
        availableForConsulting,
        consultingRates,
        contact,
        location,
        languages,
        featured,
        status
      }`;
      
      const data = await client.fetch(query);
      setExperts(data);
    } catch (error) {
      console.error('Error fetching experts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.expertise.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesExpertise = !selectedExpertise || expert.expertise === selectedExpertise;
    const matchesLocation = !selectedLocation || expert.location.country === selectedLocation;
    const matchesConsulting = !consultingOnly || expert.availableForConsulting;
    
    return matchesSearch && matchesExpertise && matchesLocation && matchesConsulting;
  });

  const getLocationString = (location: Expert['location']) => {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <KnowledgeHubNavbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <KnowledgeHubFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KnowledgeHubNavbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Knowledge Hub', href: '/knowledgehub' },
            { label: 'Experts', href: '/knowledgehub/experts' }
          ]} 
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Agricultural Experts
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Connect with leading agricultural professionals and specialists. Get expert advice, 
                consulting services, and insights from our verified network of agricultural experts.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/knowledgehub/experts/apply"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Become an Expert
              </Link>
              <div className="text-sm text-gray-500 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Login required to apply
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search experts by name, title, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} className="mr-2" />
              Filters
              <ChevronDown size={16} className={`ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expertise Area
                  </label>
                  <select
                    value={selectedExpertise}
                    onChange={(e) => setSelectedExpertise(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Areas</option>
                    {expertiseOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {Array.from(new Set(experts.map(e => e.location.country))).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={consultingOnly}
                      onChange={(e) => setConsultingOnly(e.target.checked)}
                      className="mr-2 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Available for consulting</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Users className="text-green-600 mr-3" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{experts.length}</p>
                <p className="text-sm text-gray-600">Total Experts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Award className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {experts.filter(e => e.featured).length}
                </p>
                <p className="text-sm text-gray-600">Featured Experts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <MessageCircle className="text-purple-600 mr-3" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {experts.filter(e => e.availableForConsulting).length}
                </p>
                <p className="text-sm text-gray-600">Available for Consulting</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Globe className="text-orange-600 mr-3" size={24} />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(experts.map(e => e.location.country)).size}
                </p>
                <p className="text-sm text-gray-600">Countries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredExperts.length} of {experts.length} experts
          </p>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredExperts.map((expert) => (
            <div key={expert._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              {expert.featured && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 text-sm font-medium">
                  <Star size={16} className="inline mr-1" />
                  Featured Expert
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                      {expert.image && (
                        <Image
                          src={urlForImage(expert.image).url()}
                          alt={expert.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {expert.availableForConsulting && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <MessageCircle size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {expert.name}
                    </h3>
                    <p className="text-green-600 font-medium mb-1">
                      {expert.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {expert.expertise}
                    </p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {expert.bio}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-2" />
                    {expert.yearsOfExperience} years experience
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-2" />
                    {getLocationString(expert.location)}
                  </div>
                  
                  {expert.languages && expert.languages.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Globe size={14} className="mr-2" />
                      {expert.languages.slice(0, 2).join(', ')}
                      {expert.languages.length > 2 && ` +${expert.languages.length - 2} more`}
                    </div>
                  )}
                </div>
                
                {expert.specializations && expert.specializations.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {expert.specializations.slice(0, 3).map((spec, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {expert.specializations.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{expert.specializations.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${expert.contact.email}`}
                      className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                      title="Send Email"
                    >
                      <Mail size={16} />
                    </a>
                    
                    {expert.contact.linkedin && (
                      <a
                        href={expert.contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="LinkedIn Profile"
                      >
                        <Linkedin size={16} />
                      </a>
                    )}
                    
                    {expert.contact.website && (
                      <a
                        href={expert.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Website"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  
                  <Link
                    href={`/knowledgehub/experts/${expert.slug.current}`}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExperts.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No experts found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedExpertise('');
                setSelectedLocation('');
                setConsultingOnly(false);
              }}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Share Your Expertise
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Join our network of agricultural experts and help farmers and businesses succeed
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/knowledgehub/experts/apply"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Plus size={20} className="mr-2" />
              Apply to Become an Expert
            </Link>
            <p className="text-sm opacity-75">
              🔒 Login required to submit application
            </p>
          </div>
        </div>
      </main>

      <KnowledgeHubFooter />
    </div>
  );
} 