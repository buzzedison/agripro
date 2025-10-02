import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/app/lib/client'
import { urlForImage } from '@/lib/image'
import { PortableText } from '@portabletext/react'
import { format } from 'date-fns'
import { ArrowLeft, Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import ArticleStats from '../../components/ArticleStats'
import ArticleViewTracker from '../../components/ArticleViewTracker'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const insight = await client.fetch(`
    *[_type == "insight" && slug.current == $slug][0]
  `, { slug })

  return {
    title: `${insight.title} - Knowledge Hub`,
    description: insight.excerpt,
  }
}

const components = {
  block: {
    h1: ({children}: any) => (
      <h1 className="text-4xl font-bold mt-12 mb-6">{children}</h1>
    ),
    h2: ({children}: any) => (
      <h2 className="text-3xl font-bold mt-10 mb-5">{children}</h2>
    ),
    h3: ({children}: any) => (
      <h3 className="text-2xl font-semibold mt-8 mb-4">{children}</h3>
    ),
    normal: ({children}: any) => (
      <p className="text-gray-700 text-lg leading-relaxed mb-6">{children}</p>
    ),
    blockquote: ({children}: any) => (
      <blockquote className="border-l-4 border-green-500 pl-4 my-6 italic text-gray-700">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}: any) => (
      <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">{children}</ul>
    ),
    number: ({children}: any) => (
      <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700">{children}</ol>
    ),
  },
  types: {
    calloutBox: ({value}: any) => {
      const getCalloutStyle = (type: string) => {
        switch (type) {
          case 'warning':
            return {
              container: 'bg-orange-50 border border-orange-200',
              icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
              iconBg: 'bg-orange-100',
              textColor: 'text-orange-800'
            }
          case 'info':
            return {
              container: 'bg-blue-50 border border-blue-200',
              icon: <Info className="w-5 h-5 text-blue-600" />,
              iconBg: 'bg-blue-100',
              textColor: 'text-blue-800'
            }
          case 'success':
            return {
              container: 'bg-green-50 border border-green-200',
              icon: <CheckCircle className="w-5 h-5 text-green-600" />,
              iconBg: 'bg-green-100',
              textColor: 'text-green-800'
            }
          case 'error':
            return {
              container: 'bg-red-50 border border-red-200',
              icon: <XCircle className="w-5 h-5 text-red-600" />,
              iconBg: 'bg-red-100',
              textColor: 'text-red-800'
            }
          case 'tip':
            return {
              container: 'bg-purple-50 border border-purple-200',
              icon: <Lightbulb className="w-5 h-5 text-purple-600" />,
              iconBg: 'bg-purple-100',
              textColor: 'text-purple-800'
            }
          default:
            return {
              container: 'bg-gray-50 border border-gray-200',
              icon: <Info className="w-5 h-5 text-gray-600" />,
              iconBg: 'bg-gray-100',
              textColor: 'text-gray-800'
            }
        }
      }

      const style = getCalloutStyle(value.type)
      
      return (
        <div className={`${style.container} rounded-lg p-4 my-6`}>
          <div className="flex gap-3">
            <div className={`${style.iconBg} p-1 rounded-full flex-shrink-0`}>
              {style.icon}
            </div>
            <div className="flex-1">
              {value.title && (
                <h4 className={`font-semibold mb-2 ${style.textColor}`}>
                  {value.title}
                </h4>
              )}
              <div className={`${style.textColor}`}>
                {value.content}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}



export default async function InsightPage({ params }: Props) {
  const { slug } = await params
  const insight = await client.fetch(`
    *[_type == "insight" && slug.current == $slug][0] {
      title,
      excerpt,
      content,
      category,
      publishedAt,
      image
    }
  `, { slug })

  return (
    <article className="min-h-screen bg-gray-50">
      {/* View Tracker */}
      <ArticleViewTracker
        articleId={insight._id || slug}
        articleType="insight"
        articleTitle={insight.title}
      />

      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Back Button */}
          <Link
            href="/knowledgehub/insights"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Insights</span>
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              {insight.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {insight.title}
            </h1>
            <time className="text-gray-600">
              {format(new Date(insight.publishedAt), 'MMMM d, yyyy')}
            </time>
          </div>

          {insight.image && (
            <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
              <Image
                src={urlForImage(insight.image).url()}
                alt={insight.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm">
          {insight.excerpt && (
            <div className="mb-8 border-b border-gray-100 pb-8">
              <p className="text-xl text-gray-600 leading-relaxed">
                {insight.excerpt}
              </p>
            </div>
          )}

          <div className="prose prose-lg prose-green max-w-none">
            <PortableText
              value={insight.content}
              components={components}
            />
          </div>

          {/* Article Stats */}
          <ArticleStats
            articleId={insight._id || slug}
            articleType="insight"
            articleTitle={insight.title}
          />
        </div>
      </div>
    </article>
  )
}