'use client';

import Image from 'next/image';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect } from 'react';

interface ResearchPaper {
  title: string;
  slug: { current: string };
  coverImage: any;
  downloadUrl: string;
  category: string;
  publishedAt: string;
  content?: any;
}

export default function ResearchPapersSection({ researchPapers }: { researchPapers: ResearchPaper[] }) {
  useEffect(() => {
    console.log('Research papers in section:', researchPapers);
    // Debug image URLs
    if (researchPapers && researchPapers.length > 0) {
      researchPapers.forEach(paper => {
        if (paper.coverImage) {
          console.log(`Paper: ${paper.title}, Image URL:`, urlForImage(paper.coverImage).url());
        }
      });
    }
  }, [researchPapers]);

  // Limit to 3 papers for display
  const displayPapers = researchPapers ? researchPapers.slice(0, 3) : [];

  if (!researchPapers || researchPapers.length === 0) {
    return (
      <section className="bg-white rounded-2xl p-8">
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No research papers available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back soon for new academic research papers.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 sm:p-6 lg:p-10 shadow-sm border border-gray-100">
      {researchPapers.length > 3 && (
        <div className="flex justify-between items-center mb-6 sm:mb-8 lg:mb-10">
          <Link href="/knowledgehub/research" className="inline-flex items-center text-green-600 hover:text-green-800 text-sm sm:text-base font-medium transition-colors group">
            View all {researchPapers.length} research papers 
            <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
        {displayPapers.map((paper, index) => (
          <div key={paper.slug.current} className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 group hover:bg-white/80 p-4 lg:p-6 rounded-xl transition-all duration-300 hover:shadow-lg border border-transparent hover:border-gray-200">
            <div className="relative h-48 sm:h-40 lg:h-48 w-full sm:w-32 lg:w-40 flex-shrink-0 shadow-lg rounded-xl overflow-hidden transform transition-transform group-hover:scale-105">
              {paper.coverImage ? (
                <Image
                  src={urlForImage(paper.coverImage).url()}
                  alt={paper.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  priority={index === 0}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col flex-grow justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-700 font-medium">
                    {paper.category}
                  </span>
                  <time className="text-xs sm:text-sm text-gray-500 font-medium">
                    {paper.publishedAt 
                      ? format(new Date(paper.publishedAt), 'MMM d, yyyy')
                      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    }
                  </time>
                </div>
                <Link href={`/knowledgehub/research/${paper.slug.current}`}>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 text-black group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">{paper.title}</h3>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  <Link
                    href={`/knowledgehub/research/${paper.slug.current}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Read Article
                  </Link>
                  {paper.downloadUrl && (
                    <a
                      href={paper.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
