/**
 * Generate search index JSON file for client-side search
 * Run this before build: npm run generate:search
 */

import { writeFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { entities } from '../src/db/schema'

// Load environment variables
config({ path: '.env.local' })

interface SearchableEntity {
  id: string
  type: string
  slug: string
  name: string
  description: string | null
}

async function generateSearchIndex() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const pool = new Pool({ connectionString })
  const db = drizzle(pool)

  try {
    console.log('Generating search index...')

    const allEntities = await db
      .select({
        id: entities.id,
        type: entities.type,
        slug: entities.slug,
        name: entities.name,
        description: entities.description,
      })
      .from(entities)
      .orderBy(entities.name)

    const searchIndex: SearchableEntity[] = allEntities

    const outputPath = join(process.cwd(), 'public', 'search-index.json')
    writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2))

    console.log(`Generated search index with ${searchIndex.length} entities`)
    console.log(`Output: ${outputPath}`)
  } finally {
    await pool.end()
  }
}

generateSearchIndex().catch((err) => {
  console.error('Failed to generate search index:', err)
  process.exit(1)
})
