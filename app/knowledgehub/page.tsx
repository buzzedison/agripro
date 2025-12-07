'use client';

import { client } from '../lib/client';
import BestPracticesGrid from './components/BestPracticesGrid';
import ExpertsSection from './components/ExpertsSection';
import HeroSection from './components/HeroSection';
import WhitepapersSection from './components/WhitepapersSection';
import ResearchPapersSection from './components/ResearchPapersSection';
import InsightsSection from './components/InsightsSection';
import NewsletterCTA from './components/NewsletterCTA';
import SearchAndFilter from './components/SearchAndFilter';
import ToolsSection from './components/ToolsSection';
import { filterAndSearchContent } from './utils/search';
import { useState, useEffect } from 'react';
import KnowledgeHubNavbar from './components/KnowledgeHubNavbar';
import KnowledgeHubFooter from './components/KnowledgeHubFooter';
import AccessBanner from './components/AccessBanner';
import PaywallModal from './components/PaywallModal';
import { useContentAccess } from '@/lib/hooks/useContentAccess';

interface BestPractice {
  title: string;
  summary: string;
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

interface Expert {
  name: string;
  expertise: string;
  bio: string;
  image: any;
  contact: { email: string };
}

interface Whitepaper {
  title: string;
  summary: string;
  coverImage: any;
  downloadUrl: string;
  category: string;
  publishedAt: string;
  _id: string;
}

interface Course {
  title: string;
  description: string;
  duration: string;
  level: string;
  image: any;
  topics: string[];
  publishedAt: string;
}

interface Insight {
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image: any;
  slug: { current: string };
}

interface ResearchPaper {
  title: string;
  slug: { current: string };
  coverImage: any;
  downloadUrl: string;
  category: string;
  publishedAt: string;
  content?: any;
}

interface KnowledgeHubData {
  bestPractices: BestPractice[];
  experts: Expert[];
  whitepapers: Whitepaper[];
  insights: Insight[];
  researchPapers: ResearchPaper[];
}

export default function KnowledgeHub() {
  const [data, setData] = useState<KnowledgeHubData>({
    bestPractices: [],
    experts: [],
    whitepapers: [],
    insights: [],
    researchPapers: []
  });

  const [filteredData, setFilteredData] = useState<KnowledgeHubData>({
    bestPractices: [],
    experts: [],
    whitepapers: [],
    insights: [],
    researchPapers: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallContentType, setPaywallContentType] = useState('content');
  const [isSticky, setIsSticky] = useState(false);

  const { user, loading: authLoading, contentViewCount, hasReachedLimit, canAccessContent, incrementViewCount } = useContentAccess();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [bestPractices, experts, whitepapers, insights, researchPapers] = await Promise.all([
          client.fetch<BestPractice[]>(`*[_type == "bestPractices"] {
            title, summary, category, image, slug, publishedAt, lastUpdated,
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
          }`).catch(err => {
            console.error('Error fetching best practices:', err);
            return [];
          }),
          client.fetch<Expert[]>(`*[_type == "expert"] {
            name, expertise, bio, image, contact
          }`).catch(err => {
            console.error('Error fetching experts:', err);
            return [];
          }),
          client.fetch<Whitepaper[]>(`*[_type == "whitepaper"] {
            _id, title, summary, coverImage, downloadUrl, category, publishedAt
          }`).catch(err => {
            console.error('Error fetching whitepapers:', err);
            return [];
          }).then(whitepapers => {
            console.log('Fetched whitepapers in main page:', whitepapers.map(wp => ({ id: wp._id, title: wp.title })));
            return whitepapers;
          }),
          client.fetch<Insight[]>(`*[_type == "insight"] {
            title, excerpt, category, publishedAt, image, slug
          }`).catch(err => {
            console.error('Error fetching insights:', err);
            return [];
          }),
          client.fetch<ResearchPaper[]>(`*[_type == "research"] {
            title, slug, coverImage, downloadUrl, category, publishedAt, content
          }`).catch(err => {
            console.error('Error fetching research papers:', err);
            return [];
          }).then(papers => {
            console.log('Fetched research papers in main page:', papers.map(paper => ({ slug: paper.slug.current, title: paper.title })));
            return papers;
          })
        ]);

        setData({ bestPractices, experts, whitepapers, insights, researchPapers });
        setFilteredData({ bestPractices, experts, whitepapers, insights, researchPapers });
      } catch (err) {
        console.error('Error fetching Knowledge Hub data:', err);
        setError('Failed to load Knowledge Hub data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Sticky header observation
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById('hero-section')?.offsetHeight || 500;
      if (window.scrollY > heroHeight - 80) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add state to track current filters
  const [currentFilters, setCurrentFilters] = useState<{
    category: string[];
    contentType: string[];
    date: string;
  }>({
    category: [],
    contentType: [],
    date: 'all'
  });

  const handleSearch = (query: string) => {
    if (query.trim() === '') {
      handleFilter(currentFilters);
    } else {
      filterData(query, currentFilters);
    }
  };

  const handleFilter = (filters: { category: string[], contentType: string[], date: string }) => {
    setCurrentFilters(filters);
    filterData('', filters);

    // Optional: Scroll to content top when filtering if sticky
    const contentTop = document.getElementById('knowledge-content');
    if (contentTop && window.scrollY > contentTop.offsetTop) {
      window.scrollTo({ top: contentTop.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const filterData = (query: string, filters: { category: string[], contentType: string[], date: string }) => {
    // Map content types to actual data sections
    const shouldShowInsights = filters.contentType.length === 0 || filters.contentType.includes('Articles') || filters.contentType.includes('All');
    const shouldShowBestPractices = filters.contentType.length === 0 || filters.contentType.includes('Best Practices') || filters.contentType.includes('All');
    const shouldShowWhitepapers = filters.contentType.length === 0 || filters.contentType.includes('Whitepapers') || filters.contentType.includes('All');
    const shouldShowResearchPapers = filters.contentType.length === 0 || filters.contentType.includes('Research Papers') || filters.contentType.includes('All');
    const shouldShowExperts = filters.contentType.length === 0 || filters.contentType.includes('Expert Insights') || filters.contentType.includes('All');

    setFilteredData({
      insights: shouldShowInsights ? filterAndSearchContent<Insight>(data.insights, query, filters) : [],
      bestPractices: shouldShowBestPractices ? filterAndSearchContent<BestPractice>(data.bestPractices, query, filters) : [],
      whitepapers: shouldShowWhitepapers ? filterAndSearchContent<Whitepaper>(data.whitepapers, query, filters) : [],
      researchPapers: shouldShowResearchPapers ? filterAndSearchContent<ResearchPaper>(data.researchPapers, query, filters) : [],
      experts: shouldShowExperts ? data.experts : []
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Loading Knowledge Hub</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <KnowledgeHubNavbar />

      <main>
        <HeroSection />

        {/* Search & Filter Section */}
        <div className="bg-white border-b border-gray-100 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SearchAndFilter
              onSearch={handleSearch}
              onFilter={handleFilter}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AccessBanner />

          {/* No results state */}
          {filteredData.insights.length === 0 &&
            filteredData.bestPractices.length === 0 &&
            filteredData.whitepapers.length === 0 &&
            filteredData.researchPapers.length === 0 &&
            filteredData.experts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
                <div className="inline-block p-4 rounded-full bg-green-50 text-green-600 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                <button
                  onClick={() => handleFilter({ category: [], contentType: [], date: 'all' })}
                  className="mt-4 text-green-600 font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

          {/* Insights Section */}
          {filteredData.insights.length > 0 && (
            <InsightsSection insights={filteredData.insights} />
          )}

          {/* Tools Section - Temporarily hidden for cleaner layout */}
          {/* <ToolsSection /> */}

          {/* Best Practices Section */}
          {filteredData.bestPractices.length > 0 && (
            <BestPracticesGrid practices={filteredData.bestPractices} />
          )}

          {/* Whitepapers Section */}
          {filteredData.whitepapers.length > 0 && (
            <section className="py-8">
              <div className="flex items-center justify-between mb-10 border-b-2 border-green-700 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-green-700">Whitepapers</h2>
              </div>
              <WhitepapersSection whitepapers={filteredData.whitepapers} />
            </section>
          )}

          {/* Expert Contributors Section - Full Width */}
          {filteredData.experts.length > 0 && (
            <section className="py-8">
              <div className="flex items-center justify-between mb-10 border-b-2 border-green-700 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-green-700">Expert Contributors</h2>
              </div>
              <ExpertsSection experts={filteredData.experts} />
            </section>
          )}

          {/* Research Papers Section */}
          {filteredData.researchPapers.length > 0 && (
            <section className="py-8">
              <div className="flex items-center justify-between mb-10 border-b-2 border-green-700 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-green-700">Research Papers</h2>
              </div>
              <ResearchPapersSection researchPapers={filteredData.researchPapers} />
            </section>
          )}

          <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-4 sm:p-8 shadow-xl text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <svg width="200" height="200" viewBox="0 0 20 20" fill="white">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
              </svg>
            </div>
            <NewsletterCTA />
          </div>
        </div>
      </main>

      <KnowledgeHubFooter />
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        contentType={paywallContentType}
        currentPath="/knowledgehub"
      />
    </div>
  );
}
