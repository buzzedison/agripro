import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import type { FellowDesignation } from './designation'
import type { PerformanceRating } from './accountability'

export type { FellowDesignation } from './designation'
export { designationLabel, isLeadership, isAmbassador, designationRank } from './designation'
export type { PerformanceRating } from './accountability'

export type CatalystFellow = {
  id: string
  user_id: string | null
  slug: string
  email?: string
  full_name: string
  designation: FellowDesignation
  role_in_agripro: string | null
  bio: string | null
  expertise: string[]
  photo_url: string | null
  linkedin_url: string | null
  twitter_url: string | null
  website_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  country: string | null
  city: string | null
  has_business: boolean
  business_name: string | null
  business_description: string | null
  business_sector: string | null
  business_stage: string | null
  business_website: string | null
  status: 'active' | 'alumni' | 'inactive'
  weekly_hours_committed?: number | null
  commitment_started_at?: string | null
  performance_rating?: PerformanceRating
  rating_updated_at?: string | null
  total_points?: number
  is_public?: boolean
  admin_notes?: string | null
  claimed_at?: string | null
  created_at: string
  updated_at?: string
}

export type FellowContribution = {
  _id: string
  title: string
  status: string
  submissionType?: string
  submittedAt?: string
  publishedAt?: string
  linkedInsight?: { slug?: string } | null
}

// Fresh client (no CDN) — contributor data changes often
const sanityClient = createClient({ projectId, dataset, apiVersion, useCdn: false })

export async function getFellowContributions(
  email: string,
  options: { publishedOnly?: boolean } = {}
): Promise<FellowContribution[]> {
  try {
    const statusFilter = options.publishedOnly ? ' && status == "published"' : ''
    return await sanityClient.fetch(
      `*[_type == "contributorSubmission" && supabaseUserEmail == $email${statusFilter}] |
       order(coalesce(publishedAt, submittedAt, _createdAt) desc) {
        _id, title, status, submissionType, submittedAt, publishedAt,
        linkedInsight->{ "slug": slug.current }
      }`,
      { email: email.trim().toLowerCase() }
    )
  } catch (error) {
    console.error('Failed to fetch fellow contributions', error)
    return []
  }
}

export async function getContributionCountsByEmail(
  emails: string[]
): Promise<Record<string, { total: number; published: number }>> {
  if (emails.length === 0) return {}
  try {
    const rows: { supabaseUserEmail?: string; status?: string }[] = await sanityClient.fetch(
      `*[_type == "contributorSubmission" && supabaseUserEmail in $emails]{ supabaseUserEmail, status }`,
      { emails: emails.map((e) => e.trim().toLowerCase()) }
    )
    const counts: Record<string, { total: number; published: number }> = {}
    for (const row of rows) {
      const email = (row.supabaseUserEmail || '').toLowerCase()
      if (!email) continue
      counts[email] = counts[email] || { total: 0, published: 0 }
      counts[email].total += 1
      if (row.status === 'published') counts[email].published += 1
    }
    return counts
  } catch (error) {
    console.error('Failed to fetch contribution counts', error)
    return {}
  }
}

export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
