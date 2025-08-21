'use client';

import { useState, useEffect } from 'react';
import { client } from '../../lib/client';
import Image from 'next/image';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';
import Link from 'next/link';
import KnowledgeHubNavbar from '../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../components/KnowledgeHubFooter';
import Breadcrumb from '../components/Breadcrumb';

interface Whitepaper {
  title: string;
  summary: string;
  coverImage: any;
  downloadUrl: string;
  category: string;
  publishedAt: string;
  _id: string;
}

export default function WhitepapersPage() {
  const [whitepapers, setWhitepapers] = useState<Whitepaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWhitepapers() {
      try {
        setIsLoading(true);
        const fetchedWhitepapers = await client.fetch<Whitepaper[]>(`
          *[_type == "whitepaper"] {
            _id,
            title, 
            summary, 
            coverImage, 
            downloadUrl, 
            category, 
            publishedAt
          } | order(publishedAt desc)
        `);
        setWhitepapers(fetchedWhitepapers);
      } catch (err) {
        console.error('Error fetching whitepapers:', err);
        setError('Failed to load whitepapers');
      } finally {
        setIsLoading(false);
      }
    }

    fetchWhitepapers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <KnowledgeHubNavbar />
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Knowledge Hub', href: '/knowledgehub' },
            { label: 'Whitepapers', href: '/knowledgehub/whitepapers' }
          ]} 
        />
        
        <h1 className="text-3xl font-bold mb-8 mt-6">Whitepapers</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {whitepapers.map((whitepaper) => (
              <div key={whitepaper._id} className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-6">
                <div className="relative h-48 md:h-56 md:w-40 w-full flex-shrink-0">
                  {whitepaper.coverImage ? (
                    <Image
                      src={urlForImage(whitepaper.coverImage).url()}
                      alt={whitepaper.title}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-center px-2">No image available</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="mb-auto">
                    <span className="text-sm text-green-600 font-medium mb-2 block">
                      {whitepaper.category}
                    </span>
                    <Link href={`/knowledgehub/whitepapers/${whitepaper._id}`} className="hover:text-green-600">
                      <h2 className="text-2xl font-semibold mb-3">{whitepaper.title}</h2>
                    </Link>
                    {whitepaper.summary.split(/\n\n|\n/).map((para, idx) => {
                      if (para.trim().startsWith('## ')) {
                        return (
                          <h3 key={idx} className="font-bold text-lg mb-2 mt-4 text-green-800">{para.replace(/^## /, '')}</h3>
                        );
                      }
                      return (
                        <p key={idx} className="text-gray-600 mb-3 last:mb-0">{para}</p>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <time className="text-sm text-gray-500">
                      {format(new Date(whitepaper.publishedAt), 'MMM d, yyyy')}
                    </time>
                    <Link 
                      href={`/knowledgehub/whitepapers/${whitepaper._id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View Details →
                    </Link>
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
} 