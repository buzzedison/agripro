'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/image';
import { ArrowRight } from 'lucide-react';

interface Expert {
  name: string;
  expertise: string;
  bio: string;
  image: any;
  contact: { email: string };
}

export default function ExpertsSection({ experts }: { experts: Expert[] }) {
  // Show only first 4 experts (one row on lg screens)
  const displayedExperts = experts.slice(0, 4);

  return (
    <section>
      {/* Expert Cards - Single Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {displayedExperts.map((expert) => (
          <div
            key={expert.name}
            className="group text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-green-500 transition-colors">
              {expert.image && (
                <Image
                  src={urlForImage(expert.image).url()}
                  alt={expert.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
              {expert.name}
            </h3>
            <p className="text-sm text-green-700 font-medium mb-1">{expert.expertise}</p>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-8 text-center">
        <Link
          href="/knowledgehub/experts"
          className="inline-flex items-center text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
        >
          View All Expert Contributors
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}