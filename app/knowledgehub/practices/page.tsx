'use client';

import { useState, useEffect } from 'react';
import { client } from '../../lib/client';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import { Search, Filter, Download, Calendar, User } from 'lucide-react';

interface BestPractice {
  title: string;
  summary?: string;
  category: string;
  image: any;
  slug: { current: string };
  publishedAt: string;
  lastUpdated?: string;
  contributors?: Array<{
    name: string;
    role: string;
    organization: string;
  }>;
  pdfAttachments?: Array<{
    title: string;
    description?: string;
    category?: string;
    asset: {
      url: string;
    };
  }>;
}

export default function BestPracticesPage() {
  const [bestPractices, setBestPractices] = useState<BestPractice[]>([]);
  const [filteredPractices, setFilteredPractices] = useState<BestPractice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    'Crop Management',
    'Livestock',
    'Sustainability',
    'Technology',
    'Business Operations',
    'Market Analysis'
  ];

  useEffect(() => {
    async function fetchBestPractices() {
      try {
        setIsLoading(true);
        const practices = await client.fetch<BestPractice[]>(`
          *[_type == "bestPractices"] | order(publishedAt desc) {
            title,
            summary,
            category,
            image,
            slug,
            publishedAt,
            lastUpdated,
            contributors[]{
              name,
              role,
              organization
            },
            pdfAttachments[]{
              title,
              description,
              category,
              asset->{
                url
              }
            }
          }
        `);
        setBestPractices(practices);
        setFilteredPractices(practices);
      } catch (error) {
        console.error('Error fetching best practices:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBestPractices();
  }, []);

  useEffect(() => {
    let filtered = bestPractices;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(practice => practice.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(practice =>
        practice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (practice.summary && practice.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        practice.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    setFilteredPractices(filtered);
  }, [bestPractices, searchQuery, selectedCategory, sortBy]);

  const createExcerpt = (text: string | null | undefined, maxLength: number = 150) => {
    if (!text) return 'No summary available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agricultural Best Practices
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover proven techniques and strategies to improve your farming operations, 
            increase productivity, and promote sustainable agriculture.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search best practices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPractices.length} of {bestPractices.length} best practices
          </p>
        </div>

        {/* Best Practices Grid */}
        {filteredPractices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPractices.map((practice) => (
              <Link
                href={`/knowledgehub/practices/${practice.slug.current}`}
                key={practice.slug.current}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {practice.image && (
                    <Image
                      src={urlForImage(practice.image).url()}
                      alt={practice.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-sm font-medium bg-green-600 text-white rounded-full">
                      {practice.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                    {practice.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {createExcerpt(practice.summary)}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                    {practice.contributors && practice.contributors.length > 0 && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{practice.contributors[0].name}</span>
                        {practice.contributors.length > 1 && (
                          <span>+{practice.contributors.length - 1} more</span>
                        )}
                      </div>
                    )}
                    {practice.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(practice.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* PDF Attachments */}
                  {practice.pdfAttachments && practice.pdfAttachments.length > 0 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {practice.pdfAttachments.length} PDF{practice.pdfAttachments.length > 1 ? 's' : ''} available
                      </span>
                      <Download className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No best practices found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 