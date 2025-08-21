'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import { Download } from 'lucide-react';

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

export default function BestPracticesGrid({ practices }: { practices: BestPractice[] }) {
  // Function to truncate text to create an excerpt
  const createExcerpt = (text: string | null | undefined, maxLength: number = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <section className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-8 shadow-lg border border-green-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Best Practices</h2>
          <p className="text-gray-600">Proven agricultural techniques and strategies</p>
        </div>
        <Link href="/knowledgehub/best-practices" className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1">
          View all best practices
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {practices.map((practice) => (
          <Link 
            href={`/knowledgehub/practices/${practice.slug.current}`}
            key={practice.slug.current}
            className="group flex flex-col md:flex-row gap-6 bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-green-200 transition-all hover:shadow-xl p-5 hover:bg-green-50/30"
          >
            <div className="relative h-48 md:h-auto md:w-1/3 rounded-lg overflow-hidden flex-shrink-0">
              {practice.image && (
                <Image
                  src={urlForImage(practice.image).url()}
                  alt={practice.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 mb-3">
                  {practice.category}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors">
                  {practice.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {createExcerpt(practice.summary)}
                </p>
                
                {/* Contributors and Date */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                  {practice.contributors && practice.contributors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{practice.contributors[0].name}</span>
                      {practice.contributors.length > 1 && (
                        <span>+{practice.contributors.length - 1} more</span>
                      )}
                    </div>
                  )}
                  {practice.publishedAt && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(practice.publishedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                  Read more
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                
                {/* PDF Download Buttons */}
                {practice.pdfAttachments && practice.pdfAttachments.length > 0 && (
                  <div className="flex gap-2">
                    {practice.pdfAttachments.slice(0, 2).map((pdf, index) => (
                      <a
                        key={index}
                        href={pdf.asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-green-600 border border-gray-200 hover:border-green-300 px-2 py-1 rounded transition-colors"
                        title={pdf.title}
                        onClick={(e) => e.stopPropagation()} // Prevent triggering the Link
                      >
                        <Download size={14} className="mr-1" />
                        PDF
                      </a>
                    ))}
                    {practice.pdfAttachments.length > 2 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{practice.pdfAttachments.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}