'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../../lib/client';
import { urlForImage } from '@/lib/image';
import { PortableText } from '@portabletext/react';
import { format } from 'date-fns';
import KnowledgeHubNavbar from '../../components/KnowledgeHubNavbar';
import KnowledgeHubFooter from '../../components/KnowledgeHubFooter';
import ArticleDonationBanner from '../../components/ArticleDonationBanner';
import ArticleAISummary from '../../components/ArticleAISummary';
import ArticleChat from '../../components/ArticleChat';
import { ArrowLeft, Calendar, Tag, Download, Info, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface ResearchPaper {
  title: string;
  slug: { current: string };
  coverImage: any;
  downloadUrl: string;
  category: string;
  publishedAt: string;
  content: any;
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
    h4: ({children}: any) => (
      <h4 className="text-xl font-semibold mt-6 mb-3">{children}</h4>
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
  marks: {
    link: ({value, children}: any) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return (
        <a 
          href={value?.href} 
          target={target} 
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-green-600 hover:underline"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({value}: any) => {
      return (
        <div className="my-8 relative">
          <Image
            src={urlForImage(value).url()}
            alt={value.alt || 'Research paper image'}
            width={800}
            height={500}
            className="rounded-lg mx-auto"
          />
          {value.caption && (
            <p className="text-center text-sm text-gray-500 mt-2">{value.caption}</p>
          )}
        </div>
      );
    },
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
  },
};

const ResearchPaperPage = () => {
  const params = useParams();
  const { slug } = params;
  
  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaper() {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const query = `*[_type == "research" && slug.current == $slug][0] {
          title,
          slug,
          coverImage,
          downloadUrl,
          category,
          publishedAt,
          content
        }`;
        const fetchedPaper = await client.fetch<ResearchPaper>(query, { slug });
        
        if (!fetchedPaper) {
          setError('Research paper not found');
          return;
        }
        
        setPaper(fetchedPaper);
      } catch (err) {
        console.error('Error fetching research paper:', err);
        setError('Failed to load research paper. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPaper();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link
              href="/knowledgehub/research"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Research Papers
            </Link>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Loading Research Paper...</h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <KnowledgeHubNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Research Paper Not Found</h2>
            <p className="text-gray-700 mb-6">The research paper you are looking for does not exist or has been removed.</p>
            <Link
              href="/knowledgehub/research"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Research Papers
            </Link>
          </div>
        </div>
        <KnowledgeHubFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <KnowledgeHubNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/knowledgehub/research"
            className="text-gray-600 hover:text-green-600 inline-flex items-center transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Research Papers
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Hero section */}
          <div className="relative h-64 md:h-80 lg:h-96 w-full">
            {paper.coverImage ? (
              <>
                <Image
                  src={urlForImage(paper.coverImage).url()}
                  alt={paper.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-700 to-green-900 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex flex-wrap gap-3 mb-3">
                {paper.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                    <Tag size={14} className="mr-1" />
                    {paper.category}
                  </span>
                )}
                
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 shadow-sm">
                  <Calendar size={14} className="mr-1" />
                  {paper.publishedAt ? format(new Date(paper.publishedAt), 'MMMM d, yyyy') : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md">
                {paper.title}
              </h1>
            </div>
          </div>
          
          {/* Content section */}
          <div className="p-6 md:p-8 lg:p-10">
            <div className="max-w-4xl mx-auto">
              {paper.downloadUrl && (
                <div className="mb-8 p-4 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-green-800">Download Full Research Paper</h3>
                    <p className="text-sm text-green-600">Get the complete PDF version of this research paper</p>
                  </div>
                  <a 
                    href={paper.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </a>
                </div>
              )}
              
              <ArticleAISummary
                title={paper.title}
                content={typeof paper.content === 'string' ? paper.content : JSON.stringify(paper.content)}
                category={paper.category}
              />
              <div className="prose prose-lg prose-green max-w-none">
                {paper.content && (
                  <PortableText
                    value={paper.content}
                    components={components}
                  />
                )}
              </div>
              <ArticleChat
                articleTitle={paper.title}
                articleContent={typeof paper.content === 'string' ? paper.content : JSON.stringify(paper.content)}
              />
            </div>
          </div>
        </div>
      </main>
      
      <ArticleDonationBanner />
      <KnowledgeHubFooter />
    </div>
  );
};

export default ResearchPaperPage;
