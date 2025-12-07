'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';
import { ArrowRight, Download, BookOpen } from 'lucide-react';

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
  // Limit to 4 papers for display
  const displayPapers = researchPapers ? researchPapers.slice(0, 4) : [];

  if (!researchPapers || researchPapers.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No research papers available</h3>
        <p className="mt-1 text-sm text-gray-500">Check back soon for new academic research.</p>
      </div>
    );
  }

  return (
    <section>
      {/* Papers List */}
      <div className="divide-y divide-gray-200">
        {displayPapers.map((paper) => (
          <article
            key={paper.slug.current}
            className="group py-6 first:pt-0 last:pb-0"
          >
            <div className="flex gap-6">
              {/* Thumbnail */}
              <div className="relative w-20 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                {paper.coverImage ? (
                  <Image
                    src={urlForImage(paper.coverImage).url()}
                    alt={paper.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 text-xs mb-2">
                  <span className="font-bold uppercase tracking-wide text-green-700">
                    {paper.category}
                  </span>
                  {paper.publishedAt && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {format(new Date(paper.publishedAt), 'MMM d, yyyy')}
                      </span>
                    </>
                  )}
                </div>

                <Link href={`/knowledgehub/research/${paper.slug.current}`}>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 mb-3">
                    {paper.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-4">
                  <Link
                    href={`/knowledgehub/research/${paper.slug.current}`}
                    className="text-sm font-semibold text-green-700 hover:underline flex items-center"
                  >
                    Read Paper
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                  {paper.downloadUrl && (
                    <a
                      href={paper.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-500 hover:text-green-700 flex items-center gap-1"
                    >
                      <Download size={14} />
                      PDF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* View All Link */}
      {researchPapers.length > 4 && (
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link
            href="/knowledgehub/research"
            className="inline-flex items-center text-sm font-semibold text-green-700 hover:text-green-800"
          >
            View All {researchPapers.length} Research Papers
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
