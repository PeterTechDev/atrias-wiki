import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { config } from 'dotenv'
import { Pool } from 'pg'
import { isEntityId } from '../src/lib/entityId'

async function main() {
  assert.ok(isEntityId(randomUUID()))
  assert.equal(isEntityId('not-an-id'), false)
  config({ path: '.env.local', quiet: true })
  assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required; this test uses only temporary tables and rolls back.')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  Object.assign(globalThis, { pool })
  try {
    await pool.query('BEGIN')
    await pool.query('DROP TABLE IF EXISTS pg_temp.entity_favorites, pg_temp.entity_relations, pg_temp.knowledge_chunks, pg_temp.ingestion_jobs, pg_temp.wiki_dms, pg_temp.entities')
    await pool.query(`CREATE TEMP TABLE entities (
      id uuid PRIMARY KEY, type text, slug text, name text, description text,
      archived_at timestamptz, updated_at timestamptz DEFAULT now(), is_spoiler boolean DEFAULT false
    )`)
    await pool.query(readFileSync('supabase/migrations/20260908150000_entity_favorites.sql', 'utf8').replaceAll('public.', 'pg_temp.'))
    const { addFavorite, removeFavorite, isFavorite, listFavorites } = await import('../src/db/queries/favorites')
    const a = randomUUID(), b = randomUUID(), id = randomUUID(), unsupported = randomUUID()
    await pool.query("INSERT INTO entities (id, type, slug, name) VALUES ($1, 'character', 'test', 'Test'), ($2, 'session', 'session', 'Session')", [id, unsupported])
    const before = (await pool.query('SELECT * FROM entities WHERE id = $1', [id])).rows[0]
    assert.equal(await addFavorite(a, randomUUID()), false)
    assert.equal(await addFavorite(a, unsupported), false)
    assert.equal(await addFavorite(a, id), true)
    const first = await listFavorites(a)
    await Promise.all([addFavorite(a, id), addFavorite(a, id)])
    assert.deepEqual(await listFavorites(a), first)
    assert.equal(await isFavorite(b, id), false)
    assert.deepEqual(await listFavorites(b), [])
    await addFavorite(b, id)
    await removeFavorite(a, id)
    await removeFavorite(a, id)
    assert.equal(await isFavorite(a, id), false)
    assert.equal(await isFavorite(b, id), true)
    assert.deepEqual((await pool.query('SELECT * FROM entities WHERE id = $1', [id])).rows[0], before)
    await pool.query('UPDATE entities SET archived_at = now() WHERE id = $1', [id])
    assert.ok((await listFavorites(b))[0].archivedAt)
    assert.equal((await pool.query("SELECT relrowsecurity FROM pg_class WHERE oid = 'pg_temp.entity_favorites'::regclass")).rows[0].relrowsecurity, true)
    await pool.query('DELETE FROM entities WHERE id = $1', [id])
    assert.deepEqual(await listFavorites(b), [])
    console.log('Favorites: validation, isolation, idempotence, unchanged content, archiving, RLS and cascade passed')
  } finally {
    await pool.query('ROLLBACK')
    await pool.end()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
