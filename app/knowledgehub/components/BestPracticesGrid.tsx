'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { urlForImage } from '@/lib/image';
import { Download, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

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
  const router = useRouter();

  const createExcerpt = (text: string | null | undefined, maxLength: number = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (practices.length === 0) return null;

  const featuredPractice = practices[0];
  const otherPractices = practices.slice(1, 4);

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10 border-b-2 border-green-700 pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-green-700">Best Practices</h2>
        </div>
        <Link
          href="/knowledgehub/best-practices"
          className="text-sm font-medium text-gray-600 hover:text-green-700 flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Featured Practice */}
      <article
        className="group bg-white border border-gray-100 rounded-lg overflow-hidden mb-10 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => router.push(`/knowledgehub/practices/${featuredPractice.slug.current}`)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {featuredPractice.image && (
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
              <Image
                src={urlForImage(featuredPractice.image).url()}
                alt={featuredPractice.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-xs mb-4">
              <span className="font-bold uppercase tracking-wide text-green-700">
                {featuredPractice.category}
              </span>
              {featuredPractice.publishedAt && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">
                    {format(new Date(featuredPractice.publishedAt), 'MMMM d, yyyy')}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-green-700 transition-colors">
              {featuredPractice.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
              {createExcerpt(featuredPractice.summary, 200)}
            </p>
            {featuredPractice.contributors && featuredPractice.contributors.length > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                By <span className="font-medium text-gray-700">{featuredPractice.contributors[0].name}</span>
                {featuredPractice.contributors[0].organization && (
                  <span>, {featuredPractice.contributors[0].organization}</span>
                )}
              </p>
            )}
            <div className="flex items-center gap-4">
              <Link
                href={`/knowledgehub/practices/${featuredPractice.slug.current}`}
                className="text-sm font-semibold text-green-700 hover:underline flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                Read Full Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {featuredPractice.pdfAttachments && featuredPractice.pdfAttachments.length > 0 && (
                <a
                  href={featuredPractice.pdfAttachments[0].asset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-500 hover:text-green-700 flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={14} />
                  Download PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Other Practices - Clean List */}
      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {otherPractices.map((practice) => {
          const practiceUrl = `/knowledgehub/practices/${practice.slug.current}`;
          return (
            <article
              key={practice.slug.current}
              className="group py-6 cursor-pointer"
              onClick={() => router.push(practiceUrl)}
            >
              <div className="flex gap-6">
                {practice.image && (
                  <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      src={urlForImage(practice.image).url()}
                      alt={practice.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center flex-1">
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="font-bold uppercase tracking-wide text-green-700">
                      {practice.category}
                    </span>
                    {practice.publishedAt && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">
                          {format(new Date(practice.publishedAt), 'MMM d, yyyy')}
                        </span>
                      </>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                    {practice.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                    {createExcerpt(practice.summary, 100)}
                  </p>
                </div>
                <div className="hidden md:flex items-center">
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-700 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}