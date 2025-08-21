'use client';

import Image from 'next/image';
import { urlForImage } from '@/lib/image';
import Link from 'next/link';

interface Course {
  title: string;
  description: string;
  duration: string;
  level: string;
  image: any;
  topics: string[];
}

export default function CoursesSection({ courses }: { courses: Course[] }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <Link href="/knowledgehub/courses" className="text-green-600 hover:text-green-800">
          View all courses →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.title} className="bg-white rounded-xl overflow-hidden shadow-md">
            <div className="relative h-48">
              <Image
                src={urlForImage(course.image).url()}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {course.level}
                </span>
                <span className="text-sm text-gray-600">
                  {course.duration}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {course.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}