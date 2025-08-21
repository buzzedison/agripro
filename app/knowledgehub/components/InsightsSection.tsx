'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import { format } from 'date-fns';

interface Insight {
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  image: any;
  slug: { current: string };
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
            className="group"
          >
            <div className="relative h-64 mb-4 rounded-xl overflow-hidden">
              <Image
                src={urlForImage(insight.image).url()}
                alt={insight.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-sm font-medium bg-green-600 px-3 py-1 rounded-full">
                  {insight.category}
                </span>
                <h3 className="text-xl font-semibold mt-2">{insight.title}</h3>
              </div>
            </div>
            <p className="text-gray-600 line-clamp-2 mb-2">{insight.excerpt}</p>
            <time className="text-sm text-gray-500">
              {format(new Date(insight.publishedAt), 'MMM d, yyyy')}
            </time>
          </Link>
        ))}
      </div>
    </section>
  );
} 