'use client';

import Image from 'next/image';
import { urlForImage } from '@/lib/image';
import Link from 'next/link';

interface Expert {
  name: string;
  expertise: string;
  bio: string;
  image: any;
  contact: { email: string };
}

export default function ExpertsSection({ experts }: { experts: Expert[] }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <Link href="/knowledgehub/experts" className="text-green-600 hover:text-green-800">
          View all experts →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experts.map((expert) => (
          <div key={expert.name} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                {expert.image && (
                  <Image
                    src={urlForImage(expert.image).url()}
                    alt={expert.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{expert.name}</h3>
                <p className="text-green-600">{expert.expertise}</p>
              </div>
            </div>
            <p className="text-gray-600 line-clamp-3 mb-4">{expert.bio}</p>
            <button 
              onClick={() => window.location.href = `mailto:${expert.contact.email}`}
              className="text-green-600 font-medium hover:text-green-700"
            >
              Contact Expert →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
} 