import 'dotenv/config'
import dotenv from 'dotenv'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { Pool } from 'pg'

dotenv.config({ path: '.env.local', quiet: true })

// Only known local copies: never replace unrelated uploads or an empty gallery.
const copies = [
  ['abrigo-de-solaria', '0b7d204d-0557-471e-9f2a-0e7ad6954c41', '/images/places/abrigo-de-solaria.png'],
  ['abigail', '66c0718b-5421-4fe9-a077-6bf6f7ca745d', '/images/characters/solaria/abigail.png'],
  ['bertrand', '9b51760d-4b11-4389-aac3-2dc6ca64e7cc', '/images/characters/solaria/bertrand.png'],
  ['gwendolyn-de-roccia', '2a01a58a-dc88-46c9-805b-84291715735a', '/images/characters/solaria/gwendolyn-de-roccia.png'],
  ['isadora', '6c07fedf-ff1b-4b0a-b8e6-70bffd2e15bc', '/images/characters/solaria/isadora.png'],
  ['marcellus-stone', '8f4fd901-72ed-48aa-9b03-262f4ac28d16', '/images/characters/solaria/marcellus-stone.png'],
  ['lysandra', '69c5e058-72bf-42a9-87ea-25b7af33cb64', '/images/characters/solaria/lysandra.png'],
]
const prefix = 'https://janxtcbtksxrbghuoogd.supabase.co/storage/v1/object/public/wiki-media/e0143b6f-911c-4bfe-a90f-1b3b934ced60/'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
try {
  for (const [slug, file, local] of copies) {
    assert.ok(existsSync(`public${local}`), `Missing local copy: ${local}`)
    const { rows: [entity] } = await pool.query('select id, data from entities where slug = $1', [slug])
    if (!entity || !Array.isArray(entity.data?.media)) continue
    const remote = `${prefix}${file}.png`
    const media = entity.data.media.map(item => item.src === remote ? { ...item, src: local } : item)
    if (JSON.stringify(media) === JSON.stringify(entity.data.media)) continue
    console.log(`${slug}: ${remote} -> ${local}`)
    if (process.argv.includes('--apply')) {
      const result = await pool.query(
        "update entities set data = jsonb_set(data, '{media}', $1::jsonb) where id = $2 and data = $3::jsonb returning id",
        [JSON.stringify(media), entity.id, JSON.stringify(entity.data)],
      )
      assert.equal(result.rowCount, 1, `Concurrent edit: ${slug}; rerun after reviewing`)
    }
  }
  const portrait = '/images/characters/idris-portrait.jpg'
  assert.ok(existsSync(`public${portrait}`))
  const { rows: [idris] } = await pool.query("select id, data from entities where slug = 'idris-rucandel'")
  if (Array.isArray(idris?.data?.media) && idris.data.media.some(item => item.src?.startsWith('https://janxtcbtksxrbghuoogd.supabase.co/')) && !idris.data.media.some(item => item.src === portrait)) {
    console.log('idris-rucandel: add local portrait; preserve original gallery')
    if (process.argv.includes('--apply')) {
      const media = [{ type: 'image', src: portrait, alt: 'Retrato de Idris Rucandel' }, ...idris.data.media]
      const result = await pool.query("update entities set data = jsonb_set(data, '{media}', $1::jsonb) where id = $2 and data = $3::jsonb returning id", [JSON.stringify(media), idris.id, JSON.stringify(idris.data)])
      assert.equal(result.rowCount, 1, 'Concurrent edit: Idris; rerun after reviewing')
    }
  }
} finally {
  await pool.end()
}
