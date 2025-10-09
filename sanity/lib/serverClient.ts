import { createClient } from '@sanity/client'

import { apiVersion, dataset, projectId } from '../env'

export function getSanityWriteClient() {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error('Missing SANITY_API_TOKEN environment variable')
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    perspective: 'previewDrafts',
  })
}


