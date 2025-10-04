'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';
import { BookOpen, ArrowRight } from 'lucide-react';

interface Insight {
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image: any;
  slug: { current: string };
  heroImage?: { asset: any } | null;
}

export default function InsightsSection({ insights }: { insights: Insight[] }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/knowledgehub/insights"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          View all insights →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {insights.slice(0, 3).map((insight) => (
          <Link
            href={`/knowledgehub/insights/${insight.slug.current}`}
            key={insight.slug.current}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
          >
            <div className="relative h-56 w-full overflow-hidden">
              {insight.heroImage?.asset ? (
                <Image
                  src={urlForImage(insight.heroImage).width(1200).height(630).fit('crop').url()}
                  alt={insight.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : insight.image ? (
                <Image
                  src={urlForImage(insight.image).width(1200).height(630).fit('crop').url()}
                  alt={insight.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 pb-4">
                <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-green-700">
                  {insight.category || 'Insight'}
                </span>
                <span className="text-xs font-medium text-white/80">
                  {format(new Date(insight.publishedAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 px-5 pb-5 pt-6">
              <h3 className="text-xl font-semibold text-gray-900 transition group-hover:text-green-700">
                {insight.title}
              </h3>
              <p className="line-clamp-3 text-sm text-gray-600">
                {insight.excerpt || 'Read the latest analysis from our knowledge team.'}
              </p>
              <div className="flex items-center justify-between pt-3 text-sm text-green-700">
                <span className="inline-flex items-center font-semibold">
                  Read insight
                  <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                </span>
                <span className="text-xs uppercase tracking-wide text-gray-400">Insights</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 