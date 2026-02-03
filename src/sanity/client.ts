/**
 * Sanity client for fetching data
 */

import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { projectId, dataset, apiVersion, useCdn } from './config'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
})

// Image URL builder
const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

// Helper to filter out spoiler content
export function withoutSpoilers(query: string) {
  return `${query} && !isSpoiler`
}
