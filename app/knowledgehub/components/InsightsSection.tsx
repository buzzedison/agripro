'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

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
  if (insights.length === 0) return null;

  const featuredInsight = insights[0];
  const secondaryInsights = insights.slice(1, 4);

  const getImageUrl = (insight: Insight) => {
    if (insight.heroImage?.asset) {
      return urlForImage(insight.heroImage).width(1200).height(800).fit('crop').url();
    }
    if (insight.image) {
      return urlForImage(insight.image).width(1200).height(800).fit('crop').url();
    }
    return null;
  };

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10 border-b-2 border-green-700 pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-green-700">Latest Insights</h2>
        </div>
        <Link
          href="/knowledgehub/insights"
          className="text-sm font-medium text-gray-600 hover:text-green-700 flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Featured + Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Featured Article - Takes 7 columns */}
        <article className="lg:col-span-7 group">
          <Link href={`/knowledgehub/insights/${featuredInsight.slug.current}`} className="block">
            {getImageUrl(featuredInsight) && (
              <div className="relative aspect-[16/10] w-full overflow-hidden mb-6">
                <Image
                  src={getImageUrl(featuredInsight)!}
                  alt={featuredInsight.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold uppercase tracking-wide text-green-700">
                  {featuredInsight.category || 'Insight'}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-500">
                  {format(new Date(featuredInsight.publishedAt), 'MMMM d, yyyy')}
                </span>
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
                {featuredInsight.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed line-clamp-3">
                {featuredInsight.excerpt || 'Read the latest analysis from our knowledge team.'}
              </p>
              <span className="inline-flex items-center text-sm font-semibold text-green-700 mt-2 group-hover:underline">
                Read Full Article
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </div>
          </Link>
        </article>

        {/* Secondary Articles - Takes 5 columns */}
        <div className="lg:col-span-5 flex flex-col divide-y divide-gray-200">
          {secondaryInsights.map((insight, index) => (
            <article key={insight.slug.current} className={`group py-6 ${index === 0 ? 'pt-0' : ''}`}>
              <Link href={`/knowledgehub/insights/${insight.slug.current}`} className="flex gap-5">
                {getImageUrl(insight) && (
                  <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden">
                    <Image
                      src={getImageUrl(insight)!}
                      alt={insight.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <span className="font-bold uppercase tracking-wide text-green-700">
                      {insight.category || 'Insight'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
                    {insight.title}
                  </h4>
                  <span className="text-xs text-gray-500 mt-2">
                    {format(new Date(insight.publishedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}