'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isPlatformAdmin } from '@/lib/fellows/server'

export type UpdateFellowResult = { success?: boolean; error?: string }

export async function updateFellowProfile(formData: FormData): Promise<UpdateFellowResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You need to be logged in.' }
  }

  const text = (key: string) => {
    const value = formData.get(key)
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const expertise = (text('expertise') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)

  const hasBusiness = formData.get('has_business') === 'on'

  const payload = {
    full_name: text('full_name') || undefined,
    role_in_agripro: text('role_in_agripro'),
    bio: text('bio'),
    expertise,
    photo_url: text('photo_url'),
    linkedin_url: text('linkedin_url'),
    twitter_url: text('twitter_url'),
    website_url: text('website_url'),
    instagram_url: text('instagram_url'),
    facebook_url: text('facebook_url'),
    youtube_url: text('youtube_url'),
    tiktok_url: text('tiktok_url'),
    country: text('country'),
    city: text('city'),
    has_business: hasBusiness,
    business_name: hasBusiness ? text('business_name') : null,
    business_description: hasBusiness ? text('business_description') : null,
    business_sector: hasBusiness ? text('business_sector') : null,
    business_stage: hasBusiness ? text('business_stage') : null,
    business_website: hasBusiness ? text('business_website') : null,
    is_public: formData.get('is_public') === 'on',
  }

  // Admins can edit any fellow's profile (passed as fellow_id); fellows only
  // ever edit their own row. RLS enforces both regardless of what we do here.
  const fellowId = text('fellow_id')
  let query = supabase.from('catalyst_fellows').update(payload)
  if (fellowId) {
    if (!(await isPlatformAdmin(user.email))) {
      return { error: 'You can only edit your own profile.' }
    }
    query = query.eq('id', fellowId)
  } else {
    query = query.eq('user_id', user.id)
  }
  const { error } = await query

  if (error) {
    console.error('Failed to update fellow profile', error)
    return { error: 'Could not save your profile. Please try again.' }
  }

  revalidatePath('/fellowship/portal')
  revalidatePath('/fellowship/fellows')
  return { success: true }
}
