#!/usr/bin/env npx tsx
/**
 * Push extracted entities to Sanity
 * 
 * Requires SANITY_API_TOKEN env var with write permissions
 * Get one from: sanity.io/manage → API → Tokens → Add API token
 */

import { createClient } from '@sanity/client'
import * as fs from 'fs'

const INPUT_FILE = './import-output/entities.json'

interface Entity {
  type: 'character' | 'place' | 'faction' | 'item' | 'lore' | 'monster'
  name: string
  description: string
  details: Record<string, any>
  mentions: string[]
  sourceFile: string
}

async function main() {
  // Check for token
  const token = process.env.SANITY_API_TOKEN
  if (!token) {
    console.error(`
❌ Missing SANITY_API_TOKEN

To get one:
1. Go to https://www.sanity.io/manage
2. Select "Atrias Wiki" project
3. Click "API" in sidebar
4. Click "Add API token"
5. Give it a name and select "Editor" permissions
6. Copy the token and run:

   SANITY_API_TOKEN=your-token npx tsx scripts/push-to-sanity.ts
`)
    process.exit(1)
  }

  // Load entities
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ No entities file found. Run full-import.ts first.')
    process.exit(1)
  }

  const entities: Entity[] = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'))
  console.log(`\n📦 Loaded ${entities.length} entities\n`)

  // Create Sanity client
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't55m6wng',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    token,
    apiVersion: '2024-01-01',
    useCdn: false,
  })

  // Push entities
  let created = 0
  let skipped = 0
  let failed = 0

  for (const entity of entities) {
    const slug = entity.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const doc: Record<string, any> = {
      _type: entity.type,
      name: entity.name,
      slug: { _type: 'slug', current: slug },
      description: entity.description,
      isPlayerVisible: entity.type !== 'monster',
    }

    // Add type-specific fields
    if (entity.type === 'character') {
      doc.race = entity.details.race
      doc.characterClass = entity.details.class
      doc.title = entity.details.title
      doc.status = entity.details.status || 'alive'
    } else if (entity.type === 'place') {
      doc.placeType = entity.details.type || 'location'
      doc.region = entity.details.region
    } else if (entity.type === 'faction') {
      doc.factionType = entity.details.type || 'organization'
    } else if (entity.type === 'item') {
      doc.itemType = entity.details.type || 'misc'
      doc.rarity = entity.details.rarity
    }

    try {
      // Check if exists
      const existing = await client.fetch(
        `*[_type == $type && slug.current == $slug][0]._id`,
        { type: entity.type, slug }
      )

      if (existing) {
        console.log(`⏭️  ${entity.name} (exists)`)
        skipped++
        continue
      }

      await client.create(doc)
      console.log(`✅ ${entity.name}`)
      created++
    } catch (err: any) {
      console.log(`❌ ${entity.name}: ${err.message}`)
      failed++
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`
📊 RESULTS:
   ✅ Created: ${created}
   ⏭️  Skipped: ${skipped}
   ❌ Failed: ${failed}
   
🎉 Done! Check your wiki at /studio
`)
}

main().catch(console.error)
