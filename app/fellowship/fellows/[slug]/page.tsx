import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFellowContributions } from '@/lib/fellows'
import type { CatalystFellow } from '@/lib/fellows'
import { designationLabel } from '@/lib/fellows/designation'
import { createFellowsPublicClient, getFellowEmailBySlug } from '@/lib/fellows/server'
import {
  MapPin, Briefcase, Linkedin, Twitter, Globe, BookOpen,
  Sparkles, ArrowLeft, Users, Instagram, Facebook, Youtube, Music2,
} from 'lucide-react'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createFellowsPublicClient()
  const { data } = await supabase
    .from('catalyst_fellows_directory')
    .select('full_name, role_in_agripro')
    .eq('slug', slug)
    .maybeSingle()
  if (!data) return { title: 'Catalyst Fellow | AgriPro' }
  return {
    title: `${data.full_name} — Catalyst Fellow | AgriPro`,
    description: data.role_in_agripro || 'AgriPro Catalyst Fellow',
  }
}

export default async function FellowProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createFellowsPublicClient()
  const { data } = await supabase
    .from('catalyst_fellows_directory')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!data) notFound()
  const fellow = data as CatalystFellow

  // Published Knowledge Hub pieces, matched via the fellow's (private) email
  const email = await getFellowEmailBySlug(slug)
  const contributions = email
    ? await getFellowContributions(email, { publishedOnly: true })
    : []

  const location = [fellow.city, fellow.country].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#0B2C24] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <Link
            href="/fellowship/fellows"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All fellows
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {fellow.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fellow.photo_url}
                alt={fellow.full_name}
                className="w-40 h-48 rounded-2xl object-cover object-top border-4 border-white/10 shadow-lg shrink-0"
              />
            ) : (
              <div className="w-40 h-48 rounded-2xl bg-white/10 flex items-center justify-center text-5xl font-bold shrink-0">
                {fellow.full_name.charAt(0)}
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-medium mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {designationLabel(fellow.designation)}
              </div>
              <h1 className="text-3xl font-bold mb-1">{fellow.full_name}</h1>
              {fellow.role_in_agripro && (
                <p className="text-white/70">{fellow.role_in_agripro}</p>
              )}
              {location && (
                <p className="inline-flex items-center gap-1 text-white/50 text-sm mt-2">
                  <MapPin className="w-3.5 h-3.5" /> {location}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {fellow.user_id && (
              <Link
                href={`/connect/${fellow.user_id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-400 text-[#0B2C24] text-sm font-medium hover:bg-amber-300 transition-colors"
              >
                <Users className="w-4 h-4" /> Connect on AgriPro
              </Link>
            )}
            {fellow.linkedin_url && (
              <SocialLink href={fellow.linkedin_url} icon={<Linkedin className="w-4 h-4" />} label="LinkedIn" />
            )}
            {fellow.twitter_url && (
              <SocialLink href={fellow.twitter_url} icon={<Twitter className="w-4 h-4" />} label="X" />
            )}
            {fellow.instagram_url && (
              <SocialLink href={fellow.instagram_url} icon={<Instagram className="w-4 h-4" />} label="Instagram" />
            )}
            {fellow.facebook_url && (
              <SocialLink href={fellow.facebook_url} icon={<Facebook className="w-4 h-4" />} label="Facebook" />
            )}
            {fellow.youtube_url && (
              <SocialLink href={fellow.youtube_url} icon={<Youtube className="w-4 h-4" />} label="YouTube" />
            )}
            {fellow.tiktok_url && (
              <SocialLink href={fellow.tiktok_url} icon={<Music2 className="w-4 h-4" />} label="TikTok" />
            )}
            {fellow.website_url && (
              <SocialLink href={fellow.website_url} icon={<Globe className="w-4 h-4" />} label="Website" />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Bio */}
        {fellow.bio && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{fellow.bio}</p>
            {(fellow.expertise || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {fellow.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-green-50 text-green-800 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Business */}
        {fellow.has_business && fellow.business_name && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
              <Briefcase className="w-5 h-5 text-[#0B2C24]" /> {fellow.business_name}
            </h2>
            <div className="flex flex-wrap gap-2 mb-3 text-sm">
              {fellow.business_sector && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  {fellow.business_sector}
                </span>
              )}
              {fellow.business_stage && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                  {fellow.business_stage} stage
                </span>
              )}
            </div>
            {fellow.business_description && (
              <p className="text-gray-700 leading-relaxed">{fellow.business_description}</p>
            )}
            {fellow.business_website && (
              <a
                href={fellow.business_website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#0B2C24] hover:underline"
              >
                <Globe className="w-4 h-4" /> Visit website
              </a>
            )}
          </section>
        )}

        {/* Knowledge Hub contributions */}
        {contributions.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
              <BookOpen className="w-5 h-5 text-[#0B2C24]" /> Knowledge Hub contributions
            </h2>
            <ul className="divide-y divide-gray-100">
              {contributions.map((c) => (
                <li key={c._id} className="py-3 first:pt-0 last:pb-0">
                  {c.linkedInsight?.slug ? (
                    <Link
                      href={`/knowledgehub/insights/${c.linkedInsight.slug}`}
                      className="font-medium text-gray-900 hover:text-[#0B2C24] hover:underline"
                    >
                      {c.title}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-900">{c.title}</span>
                  )}
                  {c.publishedAt && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {new Date(c.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm transition-colors"
    >
      {icon} {label}
    </a>
  )
}
