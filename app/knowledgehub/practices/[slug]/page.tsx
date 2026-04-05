import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/app/lib/client'
import { urlForImage } from '@/lib/image'
import { PortableText } from '@portabletext/react'
import { format } from 'date-fns'
import { ArrowLeft, Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import ArticleDonationBanner from '../../components/ArticleDonationBanner'
import ArticleAISummary from '../../components/ArticleAISummary';
import ArticleChat from '../../components/ArticleChat';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const practice = await client.fetch(`
    *[_type == "bestPractices" && slug.current == $slug][0]
  `, { slug })

  return {
    title: `${practice.title} - Best Practices`,
    description: practice.summary,
  }
}

// Custom PortableText components to avoid yellow colors
const portableTextComponents = {
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

export default async function BestPracticePage({ params }: Props) {
  const { slug } = await params
  const practice = await client.fetch(`
    *[_type == "bestPractices" && slug.current == $slug][0] {
      title,
      summary,
      mainContent,
      category,
      image,
      publishedAt,
      lastUpdated,
      resources,
      contributors,
      pdfAttachments[]{
        title,
        description,
        category,
        asset->{
          url
        }
      },
      "totalContributors": count(contributors)
    }
  `, { slug })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Back Button */}
          <Link 
            href="/knowledgehub/practices" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Best Practices</span>
          </Link>
          
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              {practice.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {practice.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600 text-sm">
              <time>Published: {format(new Date(practice.publishedAt), 'MMMM d, yyyy')}</time>
              {practice.lastUpdated && (
                <time>Updated: {format(new Date(practice.lastUpdated), 'MMMM d, yyyy')}</time>
              )}
            </div>
          </div>

          {practice.image && (
            <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden">
              <Image
                src={urlForImage(practice.image).url()}
                alt={practice.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-8 md:p-12 shadow-sm">
          {/* Summary */}
          {practice.summary && (
            <div className="mb-12 border-b border-gray-100 pb-8">
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {practice.summary}
              </p>
            </div>
          )}

          {/* Main Content */}
          <ArticleAISummary
            title={practice.title}
            content={practice.summary ?? practice.title}
            category={practice.category}
          />
          <div className="prose prose-lg prose-green max-w-none mb-12">
            <PortableText value={practice.mainContent} components={portableTextComponents} />
          </div>
          <ArticleChat
            articleTitle={practice.title}
            articleContent={practice.summary ?? practice.title}
          />

          {/* PDF Attachments Section */}
          {practice.pdfAttachments && practice.pdfAttachments.length > 0 && (
            <div className="border-t border-gray-100 pt-8 mb-12">
              <h2 className="text-2xl font-semibold mb-6">PDF Downloads</h2>
              <div className="grid gap-6">
                {practice.pdfAttachments.map((pdf: any, index: number) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{pdf.title}</h3>
                        {pdf.description && (
                          <p className="text-gray-600 mb-3">{pdf.description}</p>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {pdf.category || 'PDF Document'}
                          </span>
                          <a 
                            href={pdf.asset?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 font-medium"
                            download
                          >
                            Download PDF →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources Section */}
          {practice.resources && practice.resources.length > 0 && (
            <div className="border-t border-gray-100 pt-8 mb-12">
              <h2 className="text-2xl font-semibold mb-6">Additional Resources</h2>
              <div className="grid gap-6">
                {practice.resources.map((resource: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                        <p className="text-gray-600 mb-3">{resource.description}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                            {resource.type}
                          </span>
                          <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            View Resource →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributors Section */}
          {practice.contributors && practice.contributors.length > 0 && (
            <div className="border-t border-gray-100 pt-8">
              <h2 className="text-2xl font-semibold mb-6">Contributors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {practice.contributors.map((contributor: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {contributor.image && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image
                          src={urlForImage(contributor.image).url()}
                          alt={contributor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{contributor.name}</h3>
                      <p className="text-gray-600 text-sm">{contributor.role}</p>
                      {contributor.organization && (
                        <p className="text-gray-500 text-sm">{contributor.organization}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ArticleDonationBanner />
    </div>
  )
}