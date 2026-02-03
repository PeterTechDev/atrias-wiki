#!/usr/bin/env npx tsx
/**
 * Full Import: All documents → Structured entities
 * Normalized types matching Sanity schema
 */

import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import mammoth from 'mammoth'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const openai = new OpenAI()
const CONTENT_DIR = './content-inbox'
const OUTPUT_DIR = './import-output'

interface Entity {
  type: 'character' | 'place' | 'faction' | 'item' | 'lore' | 'monster'
  name: string
  description: string
  details: Record<string, any>
  mentions: string[]
  sourceFile: string
}

// Strict prompt for consistent types
const EXTRACTION_PROMPT = `You are analyzing a D&D homebrew document from "Átrias" (Portuguese setting).

Extract ALL named entities. Return ONLY valid JSON:
{
  "summary": "Brief English summary (2 sentences)",
  "entities": [
    {
      "type": "character|place|faction|item|lore|monster",
      "name": "Name (keep Portuguese)",
      "description": "English description (1-2 sentences)",
      "details": {},
      "mentions": ["other entity names referenced"]
    }
  ]
}

STRICT TYPE RULES:
- character: ANY named person (NPCs, heroes, villains, shopkeepers, rulers)
- place: Cities, villages, regions, buildings, landmarks, temples, inns
- faction: Organizations, religions, guilds, orders, governments, races/peoples
- item: Weapons, artifacts, magical items, important objects
- lore: Historical events, magic systems, rules, concepts, prophecies
- monster: Creatures, beasts, unique enemies

Extract EVERY named entity. Be thorough. Minor NPCs count as characters.
Preserve Portuguese names exactly as written.`

async function extractText(filepath: string): Promise<string> {
  const ext = path.extname(filepath).toLowerCase()
  
  if (ext === '.docx') {
    const buffer = fs.readFileSync(filepath)
    const { value } = await mammoth.extractRawText({ buffer })
    return value
  }
  
  if (ext === '.rtf') {
    try {
      const { stdout } = await execAsync(`unrtf --text "${filepath}" 2>/dev/null`)
      return stdout.replace(/-{10,}/g, '').replace(/\n{3,}/g, '\n\n')
    } catch {
      const raw = fs.readFileSync(filepath, 'utf-8')
      return raw.replace(/\\[a-z]+\d*\s?|\{|\}/g, ' ').replace(/\s+/g, ' ')
    }
  }
  
  return ''
}

async function extractEntities(text: string, filename: string): Promise<Entity[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `File: ${filename}\n\n${text.slice(0, 14000)}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{}')
    return (result.entities || []).map((e: any) => ({
      type: validateType(e.type),
      name: e.name || 'Unknown',
      description: e.description || '',
      details: e.details || {},
      mentions: e.mentions || [],
      sourceFile: filename
    }))
  } catch (err) {
    console.error(`   ❌ AI error: ${err}`)
    return []
  }
}

function validateType(t: string): Entity['type'] {
  const valid = ['character', 'place', 'faction', 'item', 'lore', 'monster']
  const normalized = t?.toLowerCase()
  if (valid.includes(normalized)) return normalized as Entity['type']
  
  // Map common variations
  const map: Record<string, Entity['type']> = {
    'person': 'character', 'npc': 'character', 'personagem': 'character',
    'village': 'place', 'city': 'place', 'location': 'place', 'local': 'place',
    'organization': 'faction', 'religion': 'faction', 'order': 'faction', 'race': 'faction',
    'weapon': 'item', 'artifact': 'item', 'object': 'item',
    'event': 'lore', 'history': 'lore', 'concept': 'lore', 'magic': 'lore',
    'creature': 'monster', 'beast': 'monster'
  }
  return map[normalized] || 'lore'
}

async function main() {
  console.log('\n🏰 ÁTRIAS WIKI - FULL IMPORT\n')
  
  // Find all documents
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.docx') || f.endsWith('.rtf'))
  
  console.log(`📁 Found ${files.length} documents\n`)
  
  const allEntities: Entity[] = []
  
  for (const file of files) {
    console.log(`📄 ${file}`)
    
    const text = await extractText(path.join(CONTENT_DIR, file))
    if (text.length < 100) {
      console.log('   ⚠️ Too short, skipping')
      continue
    }
    
    console.log(`   📝 ${text.length} chars`)
    const entities = await extractEntities(text, file)
    console.log(`   ✅ ${entities.length} entities`)
    
    allEntities.push(...entities)
    await new Promise(r => setTimeout(r, 500))
  }
  
  // Deduplicate
  const unique = new Map<string, Entity>()
  for (const e of allEntities) {
    const key = `${e.type}:${e.name.toLowerCase().trim()}`
    if (!unique.has(key)) {
      unique.set(key, e)
    } else {
      const existing = unique.get(key)!
      existing.mentions = [...new Set([...existing.mentions, ...e.mentions])]
      if (!existing.description && e.description) existing.description = e.description
    }
  }
  
  const entities = Array.from(unique.values())
  
  // Stats
  const byType: Record<string, number> = {}
  for (const e of entities) byType[e.type] = (byType[e.type] || 0) + 1
  
  console.log(`\n📊 RESULTS: ${entities.length} unique entities`)
  const icons: Record<string, string> = { character: '👤', place: '🗺️', faction: '⚔️', item: '🗡️', lore: '📜', monster: '👹' }
  for (const [t, c] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${icons[t]} ${t}: ${c}`)
  }
  
  // Save
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR)
  fs.writeFileSync(`${OUTPUT_DIR}/entities.json`, JSON.stringify(entities, null, 2))
  fs.writeFileSync(`${OUTPUT_DIR}/stats.json`, JSON.stringify({ total: entities.length, byType, files: files.length }, null, 2))
  
  console.log(`\n💾 Saved to ${OUTPUT_DIR}/entities.json`)
  console.log('✅ Import complete!\n')
}

main().catch(console.error)
