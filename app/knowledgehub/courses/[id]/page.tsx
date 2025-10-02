import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { client } from '@/app/lib/client'
import { urlForImage } from '@/lib/image'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const course = await client.fetch(`
    *[_type == "course" && _id == $id][0]
  `, { id })

  return {
    title: `${course.title} - Courses`,
    description: course.description,
  }
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params
  const course = await client.fetch(`
    *[_type == "course" && _id == $id][0]
  `, { id })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
         <Link
           href="/knowledgehub/courses"
           className="text-gray-600 hover:text-green-600 inline-flex items-center transition-colors group"
         >
           <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
           Back to Courses
         </Link>
       </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {course.image && (
          <div className="relative h-[300px]">
            <Image
              src={urlForImage(course.image).url()}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              {course.level}
            </span>
            <span className="text-gray-600">{course.duration}</span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-gray-600 text-lg mb-8">{course.description}</p>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Topics Covered</h2>
            <div className="flex flex-wrap gap-2">
              {course.topics.map((topic: string) => (
                <span
                  key={topic}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}