'use client';

import { useState, useEffect } from 'react';
import { client } from '../../../lib/client';
import Image from 'next/image';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';
import KnowledgeHubNavbar from '../../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../../components/KnowledgeHubFooter';
import Breadcrumb from '../../components/Breadcrumb';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Whitepaper {
  title: string;
  summary: string;
  coverImage: any;
  downloadUrl: string;
  category: string;
  publishedAt: string;
  _id: string;
}

export default function WhitepaperPage({ params }: { params: Promise<{ id: string }> }) {
  const [whitepaper, setWhitepaper] = useState<Whitepaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whitepaperIdResolved, setWhitepaperIdResolved] = useState<string | null>(null);

  // Resolve params on mount (Next.js 15 compatibility)
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setWhitepaperIdResolved(resolved.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!whitepaperIdResolved) return;

    async function fetchWhitepaper() {
      try {
        setIsLoading(true);
        console.log('Fetching whitepaper with ID:', whitepaperIdResolved);
        
        // First try to get all whitepapers to debug
        const allWhitepapers = await client.fetch<Whitepaper[]>(`
          *[_type == "whitepaper"] {
            _id,
            title,
            summary,
            coverImage,
            downloadUrl,
            category,
            publishedAt
          }
        `);
        
        console.log('All whitepapers:', allWhitepapers.map(wp => ({ id: wp._id, title: wp.title })));
        
        // Then try to find the specific whitepaper
        const fetchedWhitepaper = allWhitepapers.find(wp => wp._id === whitepaperIdResolved);
        
        console.log('Fetched whitepaper:', fetchedWhitepaper);
        setWhitepaper(fetchedWhitepaper || null);
      } catch (err) {
        console.error('Error fetching whitepaper:', err);
        setError('Failed to load whitepaper details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchWhitepaper();
  }, [whitepaperIdResolved]);

  return (
    <div className="min-h-screen bg-gray-50">
      <KnowledgeHubNavbar />
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Knowledge Hub', href: '/knowledgehub' },
            { label: 'Whitepapers', href: '/knowledgehub/whitepapers' },
            { label: whitepaper?.title || 'Loading...', href: `/knowledgehub/whitepapers/${whitepaperIdResolved || ''}` }
          ]} 
        />
        
        {/* Back Button */}
        <Link 
          href="/knowledgehub/whitepapers" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mt-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Whitepapers</span>
        </Link>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : whitepaper ? (
          <div className="bg-white rounded-xl shadow-md p-8 mt-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="relative h-80 w-full">
                  {whitepaper.coverImage ? (
                    <Image
                      src={urlForImage(whitepaper.coverImage).url()}
                      alt={whitepaper.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-center px-4">No image available</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <a
                    href={whitepaper.downloadUrl}
                    className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download PDF
                  </a>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <span className="text-sm text-green-600 font-medium mb-2 block">
                  {whitepaper.category}
                </span>
                <h1 className="text-3xl font-bold mb-4">{whitepaper.title}</h1>
                <time className="text-sm text-gray-500 block mb-6">
                  Published on {format(new Date(whitepaper.publishedAt), 'MMMM d, yyyy')}
                </time>
                
                <div className="prose max-w-none">
                  <h2 className="text-xl font-semibold mb-4">Summary</h2>
                  <p className="text-gray-700 whitespace-pre-line">{whitepaper.summary}</p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link 
                    href="/knowledgehub/whitepapers" 
                    className="text-green-600 hover:text-green-700 font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Whitepapers
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
                      <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
            Whitepaper not found
          </div>
        )}
      </main>
      <KnowledgeHubFooter />
    </div>
  );
}