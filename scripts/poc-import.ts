#!/usr/bin/env npx tsx
/**
 * POC: AI-Powered Wiki Import
 * 
 * Demonstrates the full extraction pipeline on a few documents.
 * Outputs JSON + stats without needing Sanity token.
 * 
 * Usage: npx tsx scripts/poc-import.ts
 */

import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'
import mammoth from 'mammoth'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const CONTENT_DIR = path.join(__dirname, '../content-inbox')
const OUTPUT_DIR = path.join(__dirname, '../poc-output')

interface Entity {
  type: 'character' | 'place' | 'faction' | 'item' | 'lore' | 'monster'
  name: string
  description: string
  details?: Record<string, any>
  mentions?: string[]
  sourceFile: string
}

interface DocumentResult {
  filename: string
  charCount: number
  entities: Entity[]
  summary: string
}

// Text extraction
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
  
  return fs.readFileSync(filepath, 'utf-8')
}

// AI extraction
async function extractEntities(openai: OpenAI, text: string, filename: string): Promise<{ entities: Entity[], summary: string }> {
  const prompt = `Analyze this D&D document from "Átrias" (Portuguese homebrew setting).

Extract ALL entities. Return JSON:
{
  "summary": "2-3 sentence English summary",
  "entities": [
    {
      "type": "character|place|faction|item|lore|monster",
      "name": "Original Portuguese name",
      "description": "English description (1-2 sentences)",
      "details": { "race": "...", "class": "...", "type": "...", etc },
      "mentions": ["names of other entities this relates to"]
    }
  ]
}

Types:
- character: NPCs, heroes, villains
- place: cities, regions, buildings, landmarks
- faction: organizations, religions, guilds, groups
- item: weapons, artifacts, magical items
- lore: historical events, concepts, rules, magic systems
- monster: creatures, beasts, unique enemies

Be THOROUGH - extract every named entity. Include minor NPCs and locations.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: text.slice(0, 14000) }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  const result = JSON.parse(response.choices[0]?.message?.content || '{}')
  
  const entities = (result.entities || []).map((e: any) => ({
    ...e,
    sourceFile: filename
  }))
  
  return { entities, summary: result.summary || '' }
}

// Main POC
async function runPOC() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║     🏰 ÁTRIAS WIKI - AI IMPORT POC                        ║
║     Proof of Concept: Document → Structured Data          ║
╚═══════════════════════════════════════════════════════════╝
`)

  const openai = new OpenAI()
  
  // Select test documents (mix of types)
  const testDocs = [
    'SOL MANSO.docx',           // Village with NPCs
    'A Chama Branca.docx',      // Religion/faction
    'Os elfos em Átrias.docx',  // Race/lore
    'HISTÓRIA DE NORBRIA.docx', // History/places
    'A ordem de Ghalbath.rtf',  // Faction
  ].filter(f => fs.existsSync(path.join(CONTENT_DIR, f)))

  console.log(`📁 Processing ${testDocs.length} documents...\n`)
  
  const results: DocumentResult[] = []
  const allEntities: Entity[] = []
  
  for (const filename of testDocs) {
    const filepath = path.join(CONTENT_DIR, filename)
    console.log(`📄 ${filename}`)
    
    const text = await extractText(filepath)
    console.log(`   📝 ${text.length} chars extracted`)
    
    console.log(`   🤖 Analyzing with AI...`)
    const { entities, summary } = await extractEntities(openai, text, filename)
    
    console.log(`   ✅ Found ${entities.length} entities`)
    console.log(`   💡 "${summary.slice(0, 80)}..."\n`)
    
    results.push({ filename, charCount: text.length, entities, summary })
    allEntities.push(...entities)
    
    await new Promise(r => setTimeout(r, 300)) // Rate limit
  }
  
  // Deduplicate
  const uniqueMap = new Map<string, Entity>()
  for (const e of allEntities) {
    const key = `${e.type}:${e.name.toLowerCase()}`
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, e)
    } else {
      // Merge mentions
      const existing = uniqueMap.get(key)!
      existing.mentions = [...new Set([...(existing.mentions || []), ...(e.mentions || [])])]
    }
  }
  const uniqueEntities = Array.from(uniqueMap.values())
  
  // Stats
  const byType = uniqueEntities.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Build relationship graph
  const relationships: { from: string; to: string; type: string }[] = []
  for (const entity of uniqueEntities) {
    for (const mention of (entity.mentions || [])) {
      const target = uniqueEntities.find(e => 
        e.name.toLowerCase() === mention.toLowerCase() ||
        e.name.toLowerCase().includes(mention.toLowerCase())
      )
      if (target && target.name !== entity.name) {
        relationships.push({
          from: entity.name,
          to: target.name,
          type: 'relates_to'
        })
      }
    }
  }

  // Output
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    📊 RESULTS                              ║
╚═══════════════════════════════════════════════════════════╝
`)
  
  console.log(`📈 STATS:`)
  console.log(`   Documents processed: ${results.length}`)
  console.log(`   Total text analyzed: ${results.reduce((s, r) => s + r.charCount, 0).toLocaleString()} chars`)
  console.log(`   Entities extracted:  ${allEntities.length} (${uniqueEntities.length} unique)`)
  console.log(`   Relationships found: ${relationships.length}`)
  console.log()
  
  console.log(`📦 BY TYPE:`)
  const icons: Record<string, string> = { character: '👤', place: '🗺️', faction: '⚔️', item: '🗡️', lore: '📜', monster: '👹' }
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${icons[type] || '❓'} ${type}: ${count}`)
  }
  console.log()
  
  console.log(`🎯 SAMPLE ENTITIES:`)
  for (const entity of uniqueEntities.slice(0, 8)) {
    console.log(`   ${icons[entity.type]} ${entity.name}`)
    console.log(`      ${entity.description}`)
  }
  console.log()
  
  if (relationships.length > 0) {
    console.log(`🔗 SAMPLE RELATIONSHIPS:`)
    for (const rel of relationships.slice(0, 5)) {
      console.log(`   ${rel.from} → ${rel.to}`)
    }
    console.log()
  }
  
  // Save output
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  
  const output = {
    generatedAt: new Date().toISOString(),
    stats: { documents: results.length, entities: uniqueEntities.length, relationships: relationships.length, byType },
    entities: uniqueEntities,
    relationships,
    documents: results.map(r => ({ filename: r.filename, summary: r.summary, entityCount: r.entities.length }))
  }
  
  const outputPath = path.join(OUTPUT_DIR, 'extraction-results.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`💾 Full results saved to: ${outputPath}`)
  
  // Generate simple HTML viewer
  const html = generateHTMLViewer(output)
  const htmlPath = path.join(OUTPUT_DIR, 'viewer.html')
  fs.writeFileSync(htmlPath, html)
  console.log(`🌐 Interactive viewer: ${htmlPath}`)
  
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  ✅ POC COMPLETE - This is what the full import does!     ║
║                                                           ║
║  Next: Run full import on all 15+ docs → Sanity           ║
╚═══════════════════════════════════════════════════════════╝
`)
}

function generateHTMLViewer(data: any): string {
  const icons: Record<string, string> = { character: '👤', place: '🗺️', faction: '⚔️', item: '🗡️', lore: '📜', monster: '👹' }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Átrias Wiki - Extraction Preview</title>
  <style>
    * { box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a2e; color: #eee; margin: 0; padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #f4d03f; text-align: center; margin-bottom: 30px; }
    .stats { 
      display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;
      margin-bottom: 30px;
    }
    .stat { 
      background: #16213e; padding: 15px 25px; border-radius: 10px;
      text-align: center;
    }
    .stat-num { font-size: 2em; font-weight: bold; color: #f4d03f; }
    .stat-label { font-size: 0.9em; color: #aaa; }
    .filters { text-align: center; margin-bottom: 20px; }
    .filter-btn {
      background: #16213e; border: none; color: #eee; padding: 8px 16px;
      margin: 5px; border-radius: 20px; cursor: pointer; font-size: 1em;
    }
    .filter-btn:hover, .filter-btn.active { background: #f4d03f; color: #1a1a2e; }
    .entities { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 15px; max-width: 1400px; margin: 0 auto;
    }
    .entity {
      background: #16213e; padding: 15px; border-radius: 10px;
      border-left: 4px solid #f4d03f;
    }
    .entity-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .entity-icon { font-size: 1.5em; }
    .entity-name { font-weight: bold; font-size: 1.1em; }
    .entity-type { 
      font-size: 0.75em; background: #0f3460; padding: 2px 8px; 
      border-radius: 10px; text-transform: uppercase;
    }
    .entity-desc { color: #ccc; font-size: 0.95em; }
    .entity-source { color: #666; font-size: 0.8em; margin-top: 8px; }
    .entity[data-type="character"] { border-color: #3498db; }
    .entity[data-type="place"] { border-color: #2ecc71; }
    .entity[data-type="faction"] { border-color: #e74c3c; }
    .entity[data-type="item"] { border-color: #9b59b6; }
    .entity[data-type="lore"] { border-color: #f39c12; }
    .entity[data-type="monster"] { border-color: #e91e63; }
  </style>
</head>
<body>
  <h1>🏰 Átrias Wiki - AI Extraction Preview</h1>
  
  <div class="stats">
    <div class="stat">
      <div class="stat-num">${data.stats.documents}</div>
      <div class="stat-label">Documents</div>
    </div>
    <div class="stat">
      <div class="stat-num">${data.stats.entities}</div>
      <div class="stat-label">Entities</div>
    </div>
    <div class="stat">
      <div class="stat-num">${data.stats.relationships}</div>
      <div class="stat-label">Relationships</div>
    </div>
  </div>
  
  <div class="filters">
    <button class="filter-btn active" onclick="filter('all')">All</button>
    ${Object.entries(data.stats.byType).map(([type, count]) => 
      `<button class="filter-btn" onclick="filter('${type}')">${icons[type] || '❓'} ${type} (${count})</button>`
    ).join('')}
  </div>
  
  <div class="entities">
    ${data.entities.map((e: Entity) => `
      <div class="entity" data-type="${e.type}">
        <div class="entity-header">
          <span class="entity-icon">${icons[e.type] || '❓'}</span>
          <span class="entity-name">${e.name}</span>
          <span class="entity-type">${e.type}</span>
        </div>
        <div class="entity-desc">${e.description}</div>
        <div class="entity-source">📄 ${e.sourceFile}</div>
      </div>
    `).join('')}
  </div>
  
  <script>
    function filter(type) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      document.querySelectorAll('.entity').forEach(e => {
        e.style.display = (type === 'all' || e.dataset.type === type) ? 'block' : 'none';
      });
    }
  </script>
</body>
</html>`
}

runPOC().catch(console.error)
