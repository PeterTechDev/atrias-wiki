/**
 * Sanity configuration for Átrias Wiki
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'

// Used for fetching data in the app
export const useCdn = process.env.NODE_ENV === 'production'
