/**
 * Quick test: Extract entities from a single document
 * Usage: npx tsx scripts/test-extraction.ts
 */

import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import mammoth from 'mammoth'

const CONTENT_DIR = path.join(__dirname, '../content-inbox')

async function extractTextFromDocx(filepath: string): Promise<string> {
  const buffer = fs.readFileSync(filepath)
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

const EXTRACTION_PROMPT = `You are analyzing a D&D campaign document from "Átrias" (Portuguese homebrew setting).

Extract ALL entities found. Return JSON with this structure:
{
  "entities": [
    {
      "type": "character|place|faction|item|lore|monster",
      "name": "Name in Portuguese",
      "description": "Brief English description",
      "details": { "race": "...", "class": "...", etc },
      "mentions": ["other entity names this relates to"]
    }
  ],
  "summary": "Brief document summary in English"
}

Be thorough - extract EVERY named entity. Preserve Portuguese names.`

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  // Find a good test file
  const testFiles = [
    'A Chama Branca.docx',
    'Os elfos em Átrias.docx', 
    'HISTÓRIA DE NORBRIA.docx',
    'SOL MANSO.docx',
  ]
  
  let testFile = ''
  for (const f of testFiles) {
    const fp = path.join(CONTENT_DIR, f)
    if (fs.existsSync(fp)) {
      testFile = fp
      break
    }
  }
  
  if (!testFile) {
    console.error('No test file found!')
    process.exit(1)
  }
  
  console.log(`\n📄 Testing with: ${path.basename(testFile)}\n`)
  
  // Extract text
  const text = await extractTextFromDocx(testFile)
  console.log(`📝 Extracted ${text.length} characters\n`)
  console.log('--- First 500 chars ---')
  console.log(text.slice(0, 500))
  console.log('---\n')
  
  // AI Analysis
  console.log('🤖 Analyzing with GPT-4o-mini...\n')
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: EXTRACTION_PROMPT },
      { role: 'user', content: text.slice(0, 12000) }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })
  
  const result = JSON.parse(response.choices[0]?.message?.content || '{}')
  
  console.log('📊 EXTRACTION RESULTS:\n')
  console.log(`Summary: ${result.summary}\n`)
  console.log(`Found ${result.entities?.length || 0} entities:\n`)
  
  for (const entity of (result.entities || [])) {
    const emoji = {
      character: '👤',
      place: '🗺️',
      faction: '⚔️',
      item: '🗡️',
      lore: '📜',
      monster: '👹',
    }[entity.type] || '❓'
    
    console.log(`${emoji} [${entity.type.toUpperCase()}] ${entity.name}`)
    console.log(`   ${entity.description}`)
    if (entity.mentions?.length) {
      console.log(`   → Links to: ${entity.mentions.join(', ')}`)
    }
    console.log()
  }
}

main().catch(console.error)
