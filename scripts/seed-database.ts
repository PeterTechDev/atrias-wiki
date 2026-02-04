import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { entities, entityRelations, type EntityType } from '../src/db/schema'

// Load environment variables from .env.local (Next.js convention)
import { config } from 'dotenv'
config({ path: '.env.local' })

interface RawEntity {
  type: string
  name: string
  description?: string
  details?: Record<string, unknown>
  mentions?: string[]
  sourceFile?: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
}

async function seed() {
  console.log('Starting database seed...')

  // Validate DATABASE_URL
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set.\n' +
      'Please configure your database connection in .env or .env.local'
    )
  }

  const pool = new Pool({ connectionString })
  const db = drizzle(pool)

  try {
    // Read entities from JSON file with proper error handling
    const entitiesPath = join(process.cwd(), 'import-output', 'entities.json')

    if (!existsSync(entitiesPath)) {
      throw new Error(
        `Entities file not found at: ${entitiesPath}\n` +
        'Please run the import script first to generate entities.json'
      )
    }

    let rawEntities: RawEntity[]
    try {
      const fileContent = readFileSync(entitiesPath, 'utf-8')
      rawEntities = JSON.parse(fileContent)
    } catch (error) {
      throw new Error(
        `Failed to read entities file: ${error instanceof Error ? error.message : error}`
      )
    }

    if (!Array.isArray(rawEntities)) {
      throw new Error('entities.json must contain an array of entities')
    }

    console.log(`Found ${rawEntities.length} entities to import`)

    // Use transaction for atomic operations
    await db.transaction(async (tx) => {
      // Clear existing data
      console.log('Clearing existing data...')
      await tx.delete(entityRelations)
      await tx.delete(entities)

      // Track slug uniqueness
      const slugCounts = new Map<string, number>()
      const nameToSlug = new Map<string, string>()
      const nameToId = new Map<string, string>()

      // Insert entities
      console.log('Inserting entities...')
      for (const raw of rawEntities) {
        let baseSlug = slugify(raw.name)

        // Handle duplicate slugs
        const count = slugCounts.get(baseSlug) ?? 0
        const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`
        slugCounts.set(baseSlug, count + 1)

        nameToSlug.set(raw.name, slug)

        const [inserted] = await tx
          .insert(entities)
          .values({
            type: raw.type as EntityType,
            slug,
            name: raw.name,
            description: raw.description ?? null,
            data: raw.details ?? {},
            sourceFile: raw.sourceFile ?? null,
            status: 'published',
            isSpoiler: false,
          })
          .returning({ id: entities.id })

        nameToId.set(raw.name, inserted.id)
      }

      console.log(`Inserted ${rawEntities.length} entities`)

      // Create relations from mentions
      console.log('Creating relations from mentions...')
      let relationsCount = 0
      const missingTargets: string[] = []

      for (const raw of rawEntities) {
        if (!raw.mentions || raw.mentions.length === 0) continue

        const sourceId = nameToId.get(raw.name)
        if (!sourceId) continue

        for (const mention of raw.mentions) {
          const targetId = nameToId.get(mention)
          if (!targetId) {
            missingTargets.push(`"${mention}" (mentioned by "${raw.name}")`)
            continue
          }

          await tx.insert(entityRelations).values({
            sourceId,
            targetId,
            relationType: 'mentioned_in',
            confidence: 1.0,
          })
          relationsCount++
        }
      }

      console.log(`Created ${relationsCount} relations`)

      if (missingTargets.length > 0) {
        console.log(`\nWarning: ${missingTargets.length} mentioned entities not found:`)
        missingTargets.slice(0, 10).forEach(t => console.log(`  - ${t}`))
        if (missingTargets.length > 10) {
          console.log(`  ... and ${missingTargets.length - 10} more`)
        }
      }
    })

    console.log('\nSeed completed successfully!')
  } finally {
    // Always close the pool
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('\nSeed failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
