/**
 * Átrias Wiki - AI-Powered Content Import Pipeline
 * 
 * Reads DM's archive files and uses GPT to:
 * 1. Extract text from documents (docx, rtf, pdf)
 * 2. Identify entities (characters, places, factions, items)
 * 3. Detect relationships between entities
 * 4. Create Sanity documents with cross-references
 */

import { createClient } from '@sanity/client'
import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import mammoth from 'mammoth' // for docx
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Config
const CONTENT_DIR = path.join(__dirname, '../content-inbox')
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const SANITY_TOKEN = process.env.SANITY_API_TOKEN! // Need write token

// Initialize clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Types
interface ExtractedEntity {
  type: 'character' | 'place' | 'faction' | 'item' | 'lore' | 'monster'
  name: string
  aliases?: string[]
  description?: string
  details?: Record<string, any>
  relationships?: { type: string; target: string }[]
  sourceFile: string
}

interface ProcessedDocument {
  filename: string
  text: string
  entities: ExtractedEntity[]
}

// ============ TEXT EXTRACTION ============

async function extractTextFromDocx(filepath: string): Promise<string> {
  const buffer = fs.readFileSync(filepath)
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

async function extractTextFromRtf(filepath: string): Promise<string> {
  // Use unrtf or catdoc for RTF
  try {
    const { stdout } = await execAsync(`unrtf --text "${filepath}" 2>/dev/null || catdoc "${filepath}" 2>/dev/null`)
    return stdout
  } catch {
    // Fallback: read raw and strip RTF codes
    const raw = fs.readFileSync(filepath, 'utf-8')
    return raw.replace(/\\[a-z]+\d*\s?|\{|\}/g, ' ').replace(/\s+/g, ' ').trim()
  }
}

async function extractTextFromPdf(filepath: string): Promise<string> {
  // Use pdftotext (from poppler-utils)
  try {
    const { stdout } = await execAsync(`pdftotext "${filepath}" - 2>/dev/null`)
    return stdout
  } catch {
    return `[PDF extraction failed for ${path.basename(filepath)}]`
  }
}

async function extractText(filepath: string): Promise<string> {
  const ext = path.extname(filepath).toLowerCase()
  
  switch (ext) {
    case '.docx':
      return extractTextFromDocx(filepath)
    case '.rtf':
      return extractTextFromRtf(filepath)
    case '.pdf':
      return extractTextFromPdf(filepath)
    case '.txt':
    case '.md':
      return fs.readFileSync(filepath, 'utf-8')
    default:
      return ''
  }
}

// ============ AI ENTITY EXTRACTION ============

const EXTRACTION_PROMPT = `You are analyzing a D&D campaign document from the world of "Átrias" (a Portuguese homebrew setting).

Extract ALL entities you find. For each entity, identify:
- Type: character, place, faction, item, lore, monster
- Name (in original language, usually Portuguese)
- Aliases (other names mentioned)
- Description (brief summary)
- Key details (race, class, location, etc.)
- Relationships to other entities

Return JSON array of entities. Example:
[
  {
    "type": "character",
    "name": "Kilrain Rockhammer",
    "aliases": ["The Ironbound"],
    "description": "Dwarf warrior from Skeld, member of the Unlikely Heroes",
    "details": { "race": "Dwarf", "class": "Fighter", "homeland": "Skeld" },
    "relationships": [
      { "type": "member_of", "target": "Unlikely Heroes" },
      { "type": "from", "target": "Skeld" }
    ]
  },
  {
    "type": "place",
    "name": "Solaria",
    "description": "Main city, hub of the campaign",
    "details": { "type": "city", "region": "Central Átrias" }
  }
]

Be thorough - extract EVERY character, place, organization, item, and lore concept mentioned.
If something is unclear, make your best guess based on context.
Preserve Portuguese names but translate descriptions to English.`

async function extractEntitiesWithAI(text: string, filename: string): Promise<ExtractedEntity[]> {
  // Truncate very long texts
  const maxChars = 15000
  const truncatedText = text.length > maxChars ? text.slice(0, maxChars) + '\n[...truncated...]' : text
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `Document: ${filename}\n\n---\n\n${truncatedText}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })
    
    const content = response.choices[0]?.message?.content || '{"entities":[]}'
    const parsed = JSON.parse(content)
    const entities = parsed.entities || parsed || []
    
    return entities.map((e: any) => ({ ...e, sourceFile: filename }))
  } catch (error) {
    console.error(`AI extraction failed for ${filename}:`, error)
    return []
  }
}

// ============ SANITY IMPORT ============

async function createSanityDocument(entity: ExtractedEntity): Promise<string | null> {
  const slug = entity.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const baseDoc = {
    _type: entity.type,
    name: entity.name,
    slug: { _type: 'slug', current: slug },
    description: entity.description,
    isPlayerVisible: entity.type !== 'monster', // Hide monsters by default
  }

  // Add type-specific fields
  const doc = { ...baseDoc, ...mapEntityDetails(entity) }

  try {
    const result = await sanity.create(doc)
    console.log(`✅ Created ${entity.type}: ${entity.name}`)
    return result._id
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log(`⏭️  Skipped (exists): ${entity.name}`)
      return null
    }
    console.error(`❌ Failed to create ${entity.name}:`, error.message)
    return null
  }
}

function mapEntityDetails(entity: ExtractedEntity): Record<string, any> {
  const details = entity.details || {}
  
  switch (entity.type) {
    case 'character':
      return {
        race: details.race,
        characterClass: details.class,
        title: details.title,
        status: details.status || 'alive',
      }
    case 'place':
      return {
        placeType: details.type || 'location',
        region: details.region,
      }
    case 'faction':
      return {
        factionType: details.type || 'organization',
      }
    case 'item':
      return {
        itemType: details.type || 'misc',
        rarity: details.rarity,
      }
    case 'monster':
      return {
        challengeRating: details.cr,
        monsterType: details.type,
      }
    default:
      return {}
  }
}

// ============ MAIN PIPELINE ============

async function discoverFiles(): Promise<string[]> {
  const files: string[] = []
  const extensions = ['.docx', '.rtf', '.pdf', '.txt']
  
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (extensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
        files.push(fullPath)
      }
    }
  }
  
  walk(CONTENT_DIR)
  return files
}

async function processFile(filepath: string): Promise<ProcessedDocument> {
  const filename = path.basename(filepath)
  console.log(`📄 Processing: ${filename}`)
  
  const text = await extractText(filepath)
  if (!text || text.length < 50) {
    console.log(`   ⚠️  No meaningful text extracted`)
    return { filename, text: '', entities: [] }
  }
  
  console.log(`   📝 Extracted ${text.length} chars, analyzing with AI...`)
  const entities = await extractEntitiesWithAI(text, filename)
  console.log(`   🎯 Found ${entities.length} entities`)
  
  return { filename, text, entities }
}

async function runPipeline() {
  console.log('🚀 Átrias Wiki Import Pipeline\n')
  
  // Check required env vars
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY')
  if (!SANITY_PROJECT_ID) throw new Error('Missing SANITY_PROJECT_ID')
  if (!SANITY_TOKEN) throw new Error('Missing SANITY_API_TOKEN')
  
  // Discover files
  console.log('📁 Discovering content files...')
  const files = await discoverFiles()
  console.log(`   Found ${files.length} documents\n`)
  
  // Process each file
  const allEntities: ExtractedEntity[] = []
  
  for (const file of files) {
    const doc = await processFile(file)
    allEntities.push(...doc.entities)
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500))
  }
  
  // Deduplicate entities by name
  const uniqueEntities = deduplicateEntities(allEntities)
  console.log(`\n🎯 Total unique entities: ${uniqueEntities.length}`)
  
  // Import to Sanity
  console.log('\n📤 Importing to Sanity...\n')
  for (const entity of uniqueEntities) {
    await createSanityDocument(entity)
  }
  
  console.log('\n✅ Import complete!')
}

function deduplicateEntities(entities: ExtractedEntity[]): ExtractedEntity[] {
  const seen = new Map<string, ExtractedEntity>()
  
  for (const entity of entities) {
    const key = `${entity.type}:${entity.name.toLowerCase()}`
    const existing = seen.get(key)
    
    if (!existing) {
      seen.set(key, entity)
    } else {
      // Merge: combine descriptions and relationships
      existing.description = existing.description || entity.description
      existing.relationships = [
        ...(existing.relationships || []),
        ...(entity.relationships || [])
      ]
    }
  }
  
  return Array.from(seen.values())
}

// Run if called directly
runPipeline().catch(console.error)
