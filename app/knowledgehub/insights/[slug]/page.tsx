import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import clsx from 'clsx'
import { client } from '@/app/lib/client'
import { urlForImage } from '@/lib/image'
import { PortableText } from '@portabletext/react'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Quote,
  Sparkles,
  Clock,
  Bookmark,
  Calendar
} from 'lucide-react'
import ArticleStats from '../../components/ArticleStats'
import ArticleViewTracker from '../../components/ArticleViewTracker'
import AuthorBadge, { type AuthorPerson } from '../../components/AuthorBadge'
import ShareButtons from './ShareButtons'
import ArticleDonationBanner from '../../components/ArticleDonationBanner'

interface Params {
  params: Promise<{ slug: string }>
}

type SanityPerson = {
  _id: string
  _type: 'author' | 'expert'
  name?: string
  role?: string
  title?: string
  expertise?: string
  avatar?: any
  image?: any
  slug?: { current?: string }
  expertProfile?: {
    slug?: { current?: string }
    title?: string
    image?: any
    name?: string
  }
  bio?: string
  contact?: {
    email?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
  specializations?: string[]
  yearsOfExperience?: number
}

type InsightRecord = {
  _id: string
  title: string
  excerpt?: string
  content: any[]
  category?: string
  publishedAt?: string
  heroImage?: any
  image?: any
  authors?: SanityPerson[]
  contributors?: SanityPerson[]
  tags?: string[]
  topics?: string[]
}

function calculateReadingTime(content: any[]): number {
  if (!Array.isArray(content)) return 3

  const text = content
    .filter(block => block._type === 'block')
    .map(block =>
      block.children
        ?.map((child: any) => child.text || '')
        .join('') || ''
    )
    .join(' ')

  const wordCount = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

type Person = {
  id: string
  type: 'author' | 'expert'
  name: string
  roleLabel?: string
  avatar?: any
  profileUrl?: string
  bio?: string
  contact?: {
    email?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
  expertise?: string
  specializations?: string[]
  yearsOfExperience?: number
}

function mapSanityPerson(person?: SanityPerson | null): Person | null {
  if (!person?._id) {
    return null
  }

  const name = person.name ?? 'Unnamed contributor'
  const roleLabel = person.role ?? person.title ?? person.expertise ?? person.expertProfile?.title
  const avatar = person.avatar ?? person.image ?? person.expertProfile?.image

  let profileUrl: string | undefined
  if (person._type === 'expert' && person.slug?.current) {
    profileUrl = `/knowledgehub/experts/${person.slug.current}`
  } else if (person.expertProfile?.slug?.current) {
    profileUrl = `/knowledgehub/experts/${person.expertProfile.slug.current}`
  }

  return {
    id: person._id,
    type: person._type,
    name,
    roleLabel: roleLabel ?? undefined,
    avatar,
    profileUrl,
    bio: person.bio,
    contact: person.contact,
    expertise: person.expertise,
    specializations: person.specializations,
    yearsOfExperience: person.yearsOfExperience,
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const insight = await client.fetch<InsightRecord>(`
    *[_type == "insight" && slug.current == $slug][0]
  `, { slug })

  if (!insight) {
    notFound()
  }

  const heroImage = insight.heroImage ?? insight.image
  const imageUrl = heroImage ? urlForImage(heroImage).width(1200).height(630).fit('crop').url() : undefined

  return {
    title: `${insight.title} - Knowledge Hub`,
    description: insight.excerpt,
    openGraph: {
      title: insight.title,
      description: insight.excerpt,
      type: 'article',
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: insight.title,
      description: insight.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

const components = {
  block: {
    h1: ({ children }: any) => (
      <h1 className="mt-12 mb-6 text-4xl font-bold text-gray-900">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mt-10 mb-5 text-3xl font-semibold text-gray-900">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mt-8 mb-4 text-2xl font-semibold text-gray-900">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="mb-6 text-lg leading-relaxed text-gray-700">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-8 border-l-4 border-green-500 bg-green-50/80 px-6 py-4 text-lg italic text-gray-700 shadow-sm">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="mb-6 list-disc space-y-2 pl-6 text-gray-700">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="mb-6 list-decimal space-y-2 pl-6 text-gray-700">{children}</ol>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null
      const imageUrl = urlForImage(value).width(1800).fit('max').auto('format').url()

      return (
        <figure
          className={clsx(
            'my-10 rounded-3xl bg-gray-100 shadow-sm',
            value.fullWidth ? '-mx-6 md:-mx-12 lg:-mx-24' : ''
          )}
        >
          <div className="overflow-hidden rounded-3xl">
            <img
              src={imageUrl}
              alt={value.alt || value.caption || 'Insight image'}
              className="block h-auto w-full"
              loading="lazy"
            />
          </div>
          {value.caption && (
            <figcaption className="px-6 py-4 text-center text-sm text-gray-600">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    calloutBox: ({ value }: any) => {
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
    },
    quote: ({ value }: any) => (
      <div className="my-10 rounded-3xl border border-green-100 bg-gradient-to-r from-green-50 via-white to-green-50 p-8 shadow-sm">
        <Quote className="mb-4 h-6 w-6 text-green-600" />
        <blockquote className="text-xl font-medium text-gray-800">“{value.quote}”</blockquote>
        {value.attribution && (
          <cite className="mt-3 block text-sm font-semibold text-gray-500">— {value.attribution}</cite>
        )}
      </div>
    ),
    statHighlight: ({ value }: any) => (
      <div className="my-10 rounded-3xl border border-green-100 bg-white p-8 text-center shadow-sm">
        <Sparkles className="mx-auto mb-4 h-6 w-6 text-green-600" />
        <p className="text-5xl font-bold text-green-700">{value.value}</p>
        {value.label && <p className="mt-2 text-sm font-semibold text-gray-600">{value.label}</p>}
        {value.context && <p className="mt-3 text-sm text-gray-500">{value.context}</p>}
      </div>
    ),
  },
}



export default async function InsightPage({ params }: Params) {
  const { slug } = await params
  const insight = await client.fetch<InsightRecord>(`
    *[_type == "insight" && slug.current == $slug][0] {
      _id,
      title,
      excerpt,
      content,
      category,
      publishedAt,
      heroImage,
      image,
      authors[]->{
        _id,
        _type,
        name,
        role,
        title,
        expertise,
        specializations,
        yearsOfExperience,
        bio,
        contact,
        avatar,
        image,
        slug,
        expertProfile->{
          slug,
          title,
          image,
          name
        }
      },
      contributors[]->{
        _id,
        _type,
        name,
        role,
        title,
        expertise,
        specializations,
        yearsOfExperience,
        bio,
        contact,
        avatar,
        image,
        slug,
        expertProfile->{
          slug,
          title,
          image,
          name
        }
      },
      tags,
      topics
    }
  `, { slug })

  if (!insight) {
    notFound()
  }

  const heroImage = insight.heroImage ?? insight.image
  const authors = (insight.authors ?? []).map(mapSanityPerson).filter(Boolean) as Person[]
  const contributors = (insight.contributors ?? []).map(mapSanityPerson).filter(Boolean) as Person[]
  const readingTime = calculateReadingTime(insight.content)
  const allTags = [...(insight.tags || []), ...(insight.topics || [])].slice(0, 5)

  return (
    <article className="min-h-screen bg-white">
      <ArticleViewTracker
        articleId={insight._id || slug}
        articleType="insight"
        articleTitle={insight.title}
      />

      {/* Hero Section */}
      <header className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 via-white to-white" />

        <div className="relative mx-auto max-w-5xl px-4 pt-8 md:px-6 lg:px-8">
          {/* Navigation */}
          <nav className="flex items-center justify-between pb-8">
            <Link
              href="/knowledgehub/insights"
              className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-700"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              <span>All Insights</span>
            </Link>
          </nav>

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {insight.category && (
              <span className="font-bold uppercase tracking-widest text-green-700">
                {insight.category}
              </span>
            )}
            {insight.category && insight.publishedAt && (
              <span className="text-gray-300">|</span>
            )}
            {insight.publishedAt && (
              <time className="flex items-center gap-1.5 text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(insight.publishedAt), 'MMMM d, yyyy')}
              </time>
            )}
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1.5 text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              {readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            {insight.title}
          </h1>

          {/* Excerpt */}
          {insight.excerpt && (
            <p className="mt-6 text-xl leading-relaxed text-gray-600">
              {insight.excerpt}
            </p>
          )}

          {/* Author Section */}
          {authors.length > 0 && (
            <div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-8">
              <div className="flex -space-x-3">
                {authors.slice(0, 3).map((author) => (
                  <div
                    key={author.id}
                    className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-green-100 shadow-sm"
                  >
                    {author.avatar ? (
                      <Image
                        src={urlForImage(author.avatar).width(96).height(96).url()}
                        alt={author.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-green-700">
                        {author.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {authors.map(a => a.name).join(', ')}
                </p>
                {authors[0]?.roleLabel && (
                  <p className="text-sm text-gray-500">{authors[0].roleLabel}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hero Image */}
        {heroImage && (
          <div className="mx-auto mt-10 max-w-6xl px-4 md:px-6 lg:px-8">
            <div className="relative aspect-[2/1] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src={urlForImage(heroImage).width(1800).height(900).fit('crop').url()}
                alt={insight.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        )}
      </header>

      {/* Content Section */}
      <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_200px]">
          {/* Main Content */}
          <div className="min-w-0">
            <div className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h3:mt-8 prose-h3:text-xl prose-p:leading-relaxed prose-a:text-green-700 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:border-green-500 prose-blockquote:bg-green-50/50 prose-blockquote:py-1 prose-blockquote:not-italic">
              <PortableText value={insight.content} components={components} />
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="mt-12 border-t border-gray-100 pt-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-green-100 hover:text-green-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Article Stats */}
            <div className="mt-8 border-t border-gray-100 pt-8">
              <ArticleStats
                articleId={insight._id || slug}
                articleType="insight"
                articleTitle={insight.title}
              />
            </div>

            {/* Author Bio Card */}
            {authors.length > 0 && authors[0].bio && (
              <div className="mt-12 rounded-2xl bg-gray-50 p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-green-100">
                    {authors[0].avatar ? (
                      <Image
                        src={urlForImage(authors[0].avatar).width(128).height(128).url()}
                        alt={authors[0].name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-green-700">
                        {authors[0].name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Written by</p>
                    <h3 className="mt-1 text-lg font-bold text-gray-900">{authors[0].name}</h3>
                    {authors[0].roleLabel && (
                      <p className="text-sm text-green-700">{authors[0].roleLabel}</p>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{authors[0].bio}</p>
                    {authors[0].profileUrl && (
                      <Link
                        href={authors[0].profileUrl}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:underline"
                      >
                        View profile
                        <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Sticky */}
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-6">
              {/* Share Section */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Share</p>
                <ShareButtons
                  title={insight.title}
                  url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/knowledgehub/insights/${slug}`}
                />
              </div>

              {/* Quick Stats */}
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Article Info</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{readingTime} min read</span>
                  </div>
                  {insight.publishedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{format(new Date(insight.publishedAt), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {insight.category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Bookmark className="h-4 w-4 text-gray-400" />
                      <span>{insight.category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ArticleDonationBanner />

      {/* Back to top / More articles CTA */}
      <div className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-6 lg:px-8">
          <p className="text-sm text-gray-500">Enjoyed this insight?</p>
          <Link
            href="/knowledgehub/insights"
            className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-green-700 hover:underline"
          >
            Explore more insights
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  )
}
