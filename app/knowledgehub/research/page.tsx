'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../lib/client';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';
import KnowledgeHubNavbar from '../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../components/KnowledgeHubFooter';
import { BookOpen, Calendar, Tag, Download } from 'lucide-react';

interface ResearchPaper {
  title: string;
  slug: { current: string };
  coverImage: any;
  downloadUrl: string;
  category: string;
  publishedAt: string;
  content?: any;
}

const ResearchPapersPage = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function fetchPapers() {
      try {
        setIsLoading(true);
        setError(null);
        const query = `*[_type == "research"] | order(publishedAt desc) {
          title,
          slug,
          coverImage,
          downloadUrl,
          category,
          publishedAt
        }`;
        const fetchedPapers = await client.fetch<ResearchPaper[]>(query);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(fetchedPapers.map(paper => paper.category).filter(Boolean)));
        
        setPapers(fetchedPapers);
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching research papers:', err);
        setError('Failed to load research papers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPapers();
  }, []);

  // Filter papers by category if a category is selected
  const filteredPapers = activeCategory 
    ? papers.filter(paper => paper.category === activeCategory)
    : papers;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <KnowledgeHubNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/knowledgehub"
            className="text-green-600 hover:text-green-700 inline-flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Knowledge Hub
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Research Papers</h1>
          <p className="text-lg text-gray-600">
            Explore our collection of academic research papers and studies in agriculture.
          </p>
        </div>
        
        {/* Category filters */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Research Papers Found</h3>
            {activeCategory ? (
              <p className="text-gray-500 mb-4">No research papers found in the &ldquo;{activeCategory}&rdquo; category.</p>
            ) : (
              <p className="text-gray-500">No research papers are currently available.</p>
            )}
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                View All Categories
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPapers.map((paper) => (
              <div key={paper.slug.current} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full transform transition-all duration-300 hover:shadow-md hover:translate-y-[-4px]">
                <div className="relative h-48 w-full">
                  {paper.coverImage ? (
                    <Image
                      src={urlForImage(paper.coverImage).url()}
                      alt={paper.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-green-700 to-green-900 flex items-center justify-center">
                      <BookOpen size={48} className="text-white/30" />
                    </div>
                  )}
                  {paper.category && (
                    <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                      {paper.category}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <Link href={`/knowledgehub/research/${paper.slug.current}`}>
                    <h2 className="text-xl font-semibold mb-2 text-gray-900 hover:text-green-600 transition-colors">
                      {paper.title}
                    </h2>
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar size={14} className="mr-1 text-green-500" />
                    <span>
                      {paper.publishedAt 
                        ? format(new Date(paper.publishedAt), 'MMMM d, yyyy')
                        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      }
                    </span>
                  </div>
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <Link 
                      href={`/knowledgehub/research/${paper.slug.current}`}
                      className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center"
                    >
                      Read Paper
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                    {paper.downloadUrl && (
                      <a
                        href={paper.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-green-600"
                      >
                        <Download size={14} className="mr-1" />
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <KnowledgeHubFooter />
    </div>
  );
};

export default ResearchPapersPage;
