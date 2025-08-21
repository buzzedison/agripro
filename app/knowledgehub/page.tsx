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
      // If search is empty, apply current filters to show filtered data
      handleFilter(currentFilters);
    } else {
      // Use current filters when searching
      const shouldShowInsights = currentFilters.contentType.length === 0 || currentFilters.contentType.includes('Articles');
      const shouldShowBestPractices = currentFilters.contentType.length === 0 || currentFilters.contentType.includes('Best Practices');
      const shouldShowWhitepapers = currentFilters.contentType.length === 0 || currentFilters.contentType.includes('Whitepapers');
      const shouldShowResearchPapers = currentFilters.contentType.length === 0 || currentFilters.contentType.includes('Research Papers');
      const shouldShowExperts = currentFilters.contentType.length === 0 || currentFilters.contentType.includes('Expert Insights');
      
      setFilteredData({
        insights: shouldShowInsights ? filterAndSearchContent<Insight>(data.insights, query, currentFilters) : [],
        bestPractices: shouldShowBestPractices ? filterAndSearchContent<BestPractice>(data.bestPractices, query, currentFilters) : [],
        whitepapers: shouldShowWhitepapers ? filterAndSearchContent<Whitepaper>(data.whitepapers, query, currentFilters) : [],
        researchPapers: shouldShowResearchPapers ? filterAndSearchContent<ResearchPaper>(data.researchPapers, query, currentFilters) : [],
        experts: shouldShowExperts ? data.experts : []
      });
    }
  };
  
  const handleFilter = (filters: { category: string[], contentType: string[], date: string }) => {
    // Update current filters state
    setCurrentFilters(filters);
    
    // Map content types to actual data sections
    const shouldShowInsights = filters.contentType.length === 0 || filters.contentType.includes('Articles');
    const shouldShowBestPractices = filters.contentType.length === 0 || filters.contentType.includes('Best Practices');
    const shouldShowWhitepapers = filters.contentType.length === 0 || filters.contentType.includes('Whitepapers');
    const shouldShowResearchPapers = filters.contentType.length === 0 || filters.contentType.includes('Research Papers');
    const shouldShowExperts = filters.contentType.length === 0 || filters.contentType.includes('Expert Insights');
    
    setFilteredData({
      insights: shouldShowInsights ? filterAndSearchContent<Insight>(data.insights, '', filters) : [],
      bestPractices: shouldShowBestPractices ? filterAndSearchContent<BestPractice>(data.bestPractices, '', filters) : [],
      whitepapers: shouldShowWhitepapers ? filterAndSearchContent<Whitepaper>(data.whitepapers, '', filters) : [],
      researchPapers: shouldShowResearchPapers ? filterAndSearchContent<ResearchPaper>(data.researchPapers, '', filters) : [],
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <KnowledgeHubNavbar />
      <div className="flex-grow">
        <HeroSection />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <AccessBanner />
          
          <div className="mb-10 bg-white p-6 rounded-xl shadow-sm">
            <SearchAndFilter 
              onSearch={handleSearch}
              onFilter={handleFilter}
            />
          </div>
          
          {/* Moved Insights Section to the top */}
          {filteredData.insights.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
                <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </span>
                Latest Insights
              </h2>
              <InsightsSection insights={filteredData.insights} />
            </div>
          )}
          
          {/* Tools Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
              <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </span>
              Agricultural Tools
            </h2>
            <ToolsSection />
          </div>

          {/* Best Practices Section - Now full width */}
          {filteredData.bestPractices.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
                <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                Best Practices
              </h2>
              <BestPracticesGrid practices={filteredData.bestPractices} />
            </div>
          )}
          
          {(filteredData.whitepapers.length > 0 || filteredData.experts.length > 0) && (
            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 mb-10 sm:mb-16">
              {filteredData.whitepapers.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
                    <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Whitepapers
                  </h2>
                  <WhitepapersSection whitepapers={filteredData.whitepapers} />
                </div>
              )}
              {filteredData.experts.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
                    <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </span>
                    Expert Insights
                  </h2>
                  <ExpertsSection experts={filteredData.experts} />
                </div>
              )}
            </div>
          )}
          
          {/* Research Papers Section */}
          {filteredData.researchPapers.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-black mb-8 flex items-center">
                <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                </span>
                Research Papers
              </h2>
              <ResearchPapersSection researchPapers={filteredData.researchPapers} />
            </div>
          )}
          
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-4 sm:p-8 shadow-lg text-white">
            <NewsletterCTA />
          </div>
        </div>
      </div>
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
