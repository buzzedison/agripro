'use client';

import Image from 'next/image';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect } from 'react';

interface Whitepaper {
  title: string;
  summary: string;
  coverImage: any;
  downloadUrl: string;
  category: string;
  publishedAt: string;
  _id: string;
}

export default function WhitepapersSection({ whitepapers }: { whitepapers: Whitepaper[] }) {
  useEffect(() => {
    console.log('Whitepapers in section:', whitepapers);
  }, [whitepapers]);

  if (!whitepapers || whitepapers.length === 0) {
    return (
      <section className="bg-white rounded-2xl p-8">
        <div className="text-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No research papers available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back soon for new research papers and whitepapers.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl p-8">
      <div className="grid grid-cols-1 gap-8">
        {whitepapers.map((whitepaper) => (
          <div key={whitepaper._id} className="flex gap-6 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <div className="relative h-40 w-32 flex-shrink-0 shadow-md rounded-lg overflow-hidden">
              {whitepaper.coverImage ? (
                <Image
                  src={urlForImage(whitepaper.coverImage).url()}
                  alt={whitepaper.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex flex-col flex-grow">
              <span className="text-sm text-green-600 font-medium mb-2">
                {whitepaper.category}
              </span>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">{whitepaper.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {whitepaper.summary}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <time className="text-sm text-gray-500">
                  {format(new Date(whitepaper.publishedAt), 'MMM d, yyyy')}
                </time>
                <a
                  href={whitepaper.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}