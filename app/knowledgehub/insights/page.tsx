'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../lib/client';
import { urlForImage } from '@/lib/image';
import KnowledgeHubNavbar from '../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../components/KnowledgeHubFooter';
import PaywallModal from '../components/PaywallModal';
import AccessBanner from '../components/AccessBanner';
import { useContentAccess } from '@/lib/hooks/useContentAccess';
import { BookOpen, Calendar, Tag, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface Insight {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  category: string;
  publishedAt: string;
  image: any;
}

const InsightsPage = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const { user, loading: authLoading, contentViewCount, hasReachedLimit, canAccessContent, incrementViewCount } = useContentAccess();

  useEffect(() => {
    async function fetchInsights() {
      try {
        setIsLoading(true);
        setError(null);
        const query = `*[_type == "insight"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          excerpt,
          category,
          publishedAt,
          image
        }`;
        const fetchedInsights = await client.fetch<Insight[]>(query);
        setInsights(fetchedInsights);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError('Failed to load insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, []);

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
            <h2 className="text-2xl font-bold text-green-600 mb-4">Loading Insights...</h2>
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
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Agricultural Insights</h1>
        <p className="text-lg text-gray-600 mb-6">Stay informed with the latest analysis, trends, and insights in agriculture.</p>
        
        <AccessBanner />
        
        {insights.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Insights Available Yet</h3>
            <p className="text-gray-500">Check back soon for new insights!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {insights.map((insight, index) => {
              const isLocked = !user && index >= 2;
              const handleClick = (e: React.MouseEvent) => {
                if (isLocked) {
                  e.preventDefault();
                  setShowPaywall(true);
                } else if (!user) {
                  incrementViewCount();
                }
              };

              return (
                <div key={insight._id} className="relative">
                  <Link 
                    href={isLocked ? '#' : `/knowledgehub/insights/${insight.slug.current}`}
                    onClick={handleClick}
                  >
                    <div className={`bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex flex-col h-full ${isLocked ? 'opacity-75' : ''}`}>
                  <div className="relative w-full h-48">
                    {insight.image ? (
                      <Image 
                        src={urlForImage(insight.image).url()} 
                        alt={insight.title} 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <BookOpen size={48} className="text-gray-400" />
                      </div>
                    )}
                    {insight.category && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                        {insight.category}
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-green-700 mb-2 leading-tight hover:text-green-600 transition-colors">{insight.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar size={14} className="mr-1 text-green-500" />
                      <span>{format(new Date(insight.publishedAt), 'MMMM d, yyyy')}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {insight.excerpt || 'No excerpt available.'}
                    </p>
                    <div className="mt-auto pt-2 border-t border-gray-200">
                      <span className="inline-flex items-center text-green-600 text-sm font-medium">
                        Read more
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <div className="bg-white rounded-full p-3">
                    <Lock className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
              );
            })}
          </div>
        )}
      </main>
      <KnowledgeHubFooter />
      <PaywallModal 
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        contentType="insights"
        currentPath="/knowledgehub/insights"
      />
    </div>
  );
};

export default InsightsPage;
