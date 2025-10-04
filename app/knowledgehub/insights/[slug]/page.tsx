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
  Sparkles
} from 'lucide-react'
import ArticleStats from '../../components/ArticleStats'
import ArticleViewTracker from '../../components/ArticleViewTracker'
import AuthorBadge, { type AuthorPerson } from '../../components/AuthorBadge'

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

  return {
    title: `${insight.title} - Knowledge Hub`,
    description: insight.excerpt,
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
      const imageUrl = urlForImage(value).width(1600).height(1000).fit('max').url()
      return (
        <figure
          className={clsx(
            'my-10 overflow-hidden rounded-3xl bg-gray-100 shadow-sm',
            value.fullWidth ? '-mx-6 md:-mx-12 lg:-mx-24' : ''
          )}
        >
          <div
            className={clsx(
              'relative w-full overflow-hidden',
              value.fullWidth ? 'h-[320px] md:h-[460px] lg:h-[520px]' : 'h-[260px] md:h-[360px]'
            )}
          >
            <Image
              src={imageUrl}
              alt={value.alt || value.caption || 'Insight image'}
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover"
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
      }
    }
  `, { slug })

  if (!insight) {
    notFound()
  }

  const heroImage = insight.heroImage ?? insight.image
  const authors = (insight.authors ?? []).map(mapSanityPerson).filter(Boolean) as Person[]
  const contributors = (insight.contributors ?? []).map(mapSanityPerson).filter(Boolean) as Person[]

  return (
    <article className="min-h-screen bg-gray-50">
      <ArticleViewTracker
        articleId={insight._id || slug}
        articleType="insight"
        articleTitle={insight.title}
      />

      <div className="bg-gradient-to-b from-white via-white to-gray-50">
        <div className="mx-auto max-w-5xl px-4 pb-12 pt-10 md:px-6 lg:px-8">
          <Link
            href="/knowledgehub/insights"
            className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-600"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            Back to Insights
          </Link>

          <div className="mt-6 flex flex-col gap-6 md:mt-10">
            <div className="flex flex-wrap items-center gap-3">
              {insight.category && (
                <span className="inline-flex items-center rounded-full border border-green-100 bg-green-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                  {insight.category}
                </span>
              )}
              {insight.publishedAt && (
                <time className="text-sm text-gray-500">
                  {format(new Date(insight.publishedAt), 'MMMM d, yyyy')}
                </time>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              {insight.title}
            </h1>

            {(authors.length > 0 || contributors.length > 0) && (
              <div className="space-y-4">
                {authors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Written by</p>
                    <div className="flex flex-wrap gap-4">
                      {authors.map((author) => (
                        <AuthorBadge key={author.id} person={author as AuthorPerson} />
                      ))}
                    </div>
                  </div>
                )}
                {contributors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Contributors</p>
                    <div className="flex flex-wrap gap-4">
                      {contributors.map((contributor) => (
                        <AuthorBadge key={contributor.id} person={{ ...(contributor as AuthorPerson) }} label="Contributor" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {heroImage && (
            <div className="relative mt-10 overflow-hidden rounded-[28px] border border-gray-100 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
              <Image
                src={urlForImage(heroImage).width(1800).height(1000).fit('max').url()}
                alt={insight.title}
                width={1600}
                height={900}
                priority
                className="h-[320px] w-full object-cover md:h-[420px] lg:h-[520px]"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 lg:px-0">
        <div className="rounded-3xl bg-white px-6 py-10 shadow-lg ring-1 ring-gray-100 md:px-10 md:py-14">
          {insight.excerpt && (
            <div className="mb-12 rounded-3xl border border-green-100 bg-green-50/40 p-6 text-lg leading-relaxed text-gray-700 shadow-sm">
              {insight.excerpt}
            </div>
          )}

          <div className="prose prose-lg prose-green max-w-none">
            <PortableText value={insight.content} components={components} />
          </div>

          <div className="mt-12 border-t border-gray-100 pt-8">
            <ArticleStats
              articleId={insight._id || slug}
              articleType="insight"
              articleTitle={insight.title}
            />
          </div>
        </div>
      </div>
    </article>
  )
}