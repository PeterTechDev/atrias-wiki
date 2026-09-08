import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { mock } from 'node:test'
import { createRequire } from 'node:module'
import { config } from 'dotenv'
import { Pool } from 'pg'

async function main() {
  config({ path: '.env.local', quiet: true })
  assert.ok(process.env.DATABASE_URL, 'DATABASE_URL is required. Only temporary tables are used.')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  Object.assign(globalThis, { pool })
  try {
    await pool.query('BEGIN')
    // A pooled backend can retain temporary fixtures from a disconnected test.
    await pool.query('DROP TABLE IF EXISTS pg_temp.entity_favorites, pg_temp.entity_relations, pg_temp.knowledge_chunks, pg_temp.ingestion_jobs, pg_temp.wiki_dms, pg_temp.entities')
    await pool.query(`CREATE TEMP TABLE entities (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), type text NOT NULL, slug text UNIQUE NOT NULL,
      name text NOT NULL, description text, image text, data jsonb DEFAULT '{}', embedding text,
      is_spoiler boolean DEFAULT false, status text DEFAULT 'published', source_file text,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
      updated_by uuid, updated_by_source text DEFAULT 'legacy', revision integer DEFAULT 1, archived_at timestamptz
    ); CREATE TEMP TABLE entity_relations (source_id uuid, target_id uuid, relation_type text);
    CREATE TEMP TABLE knowledge_chunks (content text); CREATE TEMP TABLE ingestion_jobs (input_data jsonb);
    CREATE TEMP TABLE entity_favorites (user_id uuid, entity_id uuid REFERENCES entities(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(), PRIMARY KEY(user_id, entity_id));`)
    await pool.query(readFileSync('supabase/migrations/20260908165107_wiki_dm_spoilers.sql', 'utf8').replaceAll('public.', 'pg_temp.'))

    const queries = await import('../src/db/queries/entities')
    const { db } = await import('../src/db')
    // Keep the pooler pinned to this transaction; batch operations use real savepoints.
    mock.method(db, 'transaction', async (callback: (tx: typeof db) => Promise<unknown>) => {
      await pool.query('SAVEPOINT spoiler_batch')
      try {
        const result = await callback(db)
        await pool.query('RELEASE SAVEPOINT spoiler_batch')
        return result
      } catch (error) {
        await pool.query('ROLLBACK TO SAVEPOINT spoiler_batch')
        await pool.query('RELEASE SAVEPOINT spoiler_batch')
        throw error
      }
    })
    const { searchEntities, searchEntitiesByType } = await import('../src/db/queries/search')
    const { listFavorites, addFavorite, isFavorite } = await import('../src/db/queries/favorites')
    const { isWikiDM, setWikiDM } = await import('../src/lib/wikiPermissions')
    const dm = randomUUID(), member = randomUUID()
    const writer = { source: 'member' as const, userId: dm }
    const normalWriter = { source: 'member' as const, userId: member }
    const input = { type: 'other' as const, slug: 'public-test', name: 'Test public', description: 'public' }
    const publicPost = await queries.createEntity(input, normalWriter)
    assert.equal(publicPost.isSpoiler, false)
    assert.equal(await isWikiDM(dm), false)
    await assert.rejects(queries.createEntity({ ...input, isSpoiler: true }, normalWriter), { code: 'forbidden' })
    await assert.rejects(queries.createEntity({ ...input, isSpoiler: 'true' as unknown as boolean }, writer), { code: 'invalid' })
    await setWikiDM(dm, true)
    assert.equal(await isWikiDM(dm), true)
    const secret = await queries.createEntity({ ...input, type: 'character', slug: 'secret-test', name: 'Test secret', isSpoiler: true }, writer)
    for (const isDM of [false, true]) {
      assert.equal(Boolean(await queries.getEntityBySlug('character', secret.slug, isDM)), isDM)
      assert.equal(Boolean(await queries.getEntityById(secret.id, isDM)), isDM)
      assert.equal(Boolean(await queries.getEntityIncludingArchived(secret.id, isDM)), isDM)
      assert.equal((await queries.getAllEntities(isDM)).length, isDM ? 2 : 1)
      assert.equal((await queries.getEntitiesByType('character', isDM)).length, isDM ? 1 : 0)
      assert.equal((await queries.getEntityCounts(isDM)).total, isDM ? 2 : 1)
      assert.equal((await searchEntities('Test', 20, isDM)).length, isDM ? 2 : 1)
      assert.equal((await searchEntitiesByType('Test', ['character'], 20, isDM)).length, isDM ? 1 : 0)
    }
    const { supabase } = await import('../src/lib/supabase')
    const nextHeaders = createRequire(import.meta.url)('next/headers')
    const cookie = mock.method(nextHeaders, 'cookies', async () => ({ get: () => ({ value: 'verified-token' }) }))
    let viewer: { id: string; is_anonymous: boolean } | null = null
    const readAuth = mock.method(supabase.auth, 'getUser', async () => ({ data: { user: viewer }, error: null }))
    const publicNeighbor = await queries.createEntity({ ...input, slug: 'public-neighbor' }, normalWriter)
    await pool.query('INSERT INTO entity_relations VALUES ($1, $2, $4), ($1, $3, $4)', [publicPost.id, publicNeighbor.id, secret.id, 'knows'])
    const graph = await import('../src/app/api/graph/route')
    const search = await import('../src/app/api/search/route')
    for (const isDM of [false, true]) {
      viewer = isDM ? { id: dm, is_anonymous: false } : null
      assert.equal(Boolean(await queries.getEntityById(secret.id)), isDM, 'Server pages must validate the cookie')
      const graphResult = await (await graph.GET()).json()
      assert.equal(graphResult.nodes.some((node: { id: string }) => node.id === secret.id), isDM)
      assert.equal(graphResult.edges.some((edge: { targetId: string }) => edge.targetId === secret.id), isDM)
      const searchResult = await (await search.GET(new Request('http://localhost/api/search?q=secret'))).json()
      assert.equal(searchResult.length, isDM ? 1 : 0)
    }
    cookie.mock.restore()
    readAuth.mock.restore()
    await assert.rejects(queries.updateEntity({ id: secret.id, description: 'stolen' }, normalWriter), { code: 'not_found' })
    await assert.rejects(queries.updateEntity({ id: publicPost.id, isSpoiler: false }, normalWriter), { code: 'forbidden' })
    await assert.rejects(queries.updateEntity({ id: secret.id, isSpoiler: false }, { source: 'admin' }), { code: 'forbidden' })
    assert.equal(await addFavorite(member, secret.id), false)
    assert.equal(await addFavorite(dm, secret.id, true), true)
    assert.equal(await isFavorite(dm, secret.id), false)
    assert.deepEqual(await listFavorites(dm), [])
    assert.equal((await listFavorites(dm, true)).length, 1)
    const released = await queries.updateEntity({ id: secret.id, isSpoiler: false, expectedRevision: secret.revision }, writer)
    assert.equal(released.revision, secret.revision + 1)
    assert.ok(await queries.getEntityById(secret.id, false))
    await assert.rejects(queries.updateEntity({ id: secret.id, isSpoiler: true, expectedRevision: secret.revision }, writer), { code: 'conflict' })
    await queries.updateEntity({ id: secret.id, isSpoiler: true, expectedRevision: released.revision }, writer)
    await assert.rejects(queries.archiveEntity(secret.id, member), { code: 'not_found' })
    await queries.archiveEntity(secret.id, dm)
    assert.deepEqual(await queries.getArchivedEntities(false), [])
    assert.equal((await queries.getArchivedEntities(true)).length, 1)
    assert.equal(await queries.getArchivedEntityBySlug('character', secret.slug, false), null)
    assert.ok(await queries.getArchivedEntityBySlug('character', secret.slug, true))
    await queries.archiveEntity(publicPost.id, member)
    await assert.rejects(queries.deleteArchivedEntities([publicPost.id, secret.id], member), { code: 'conflict' })
    assert.ok(await queries.getEntityIncludingArchived(publicPost.id, false), 'A failed batch must not delete public posts either')

    // Exercise the real HTTP handlers with a validated identity supplied by Auth.
    const auth = mock.method(supabase.auth, 'getUser', async () => ({ data: { user: { id: member, is_anonymous: false, user_metadata: { isDM: true } } }, error: null }))
    const createRoute = await import('../src/app/api/wiki/entities/route')
    const request = (body: unknown, authorization = 'Bearer verified-member') => new Request('http://localhost/api/wiki/entities', { method: 'POST', headers: { authorization, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    assert.equal((await createRoute.POST(request({ ...input, isSpoiler: true }))).status, 403, 'Editable metadata must never grant DM')
    assert.equal((await createRoute.POST(request(input, ''))).status, 401)
    const adminRoute = await import('../src/app/api/admin/users/route')
    const adminRequest = (authorization: string, origin = 'http://localhost', isDM = false) => new Request('http://localhost/api/admin/users', { method: 'PATCH', headers: { authorization, origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: dm, isDM }) })
    process.env.ADMIN_SECRET = 'test-only-secret'
    assert.equal((await adminRoute.PATCH(adminRequest('Bearer verified-member', 'http://localhost', true))).status, 401)
    const basic = `Basic ${Buffer.from('admin:test-only-secret').toString('base64')}`
    assert.equal((await adminRoute.PATCH(adminRequest(basic, 'https://attacker.invalid'))).status, 403)
    const profile = mock.method(supabase, 'from', () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: dm }, error: null }) }) }) }))
    assert.equal((await adminRoute.PATCH(adminRequest(basic, 'http://localhost', true))).status, 200)
    assert.equal(await isWikiDM(dm), true)
    profile.mock.restore()
    assert.equal((await adminRoute.PATCH(adminRequest(basic))).status, 200)
    assert.equal(await isWikiDM(dm), false)
    await assert.rejects(queries.updateEntity({ id: secret.id, isSpoiler: false }, writer), { code: 'forbidden' })
    await assert.rejects(queries.deleteArchivedEntities([secret.id], dm), { code: 'conflict' })
    auth.mock.restore()
    const { PUT: syncSession } = await import('../src/app/api/wiki/session/route')
    const noUser = mock.method(supabase.auth, 'getUser', async () => ({ data: { user: null }, error: null }))
    const sessionRequest = (origin: string) => new Request('http://localhost/api/wiki/session', { method: 'PUT', headers: { origin } })
    assert.equal((await syncSession(sessionRequest('https://attacker.invalid'))).status, 403)
    const logout = await syncSession(sessionRequest('http://localhost'))
    assert.match(logout.headers.get('set-cookie') ?? '', /Max-Age=0/)
    assert.match(logout.headers.get('set-cookie') ?? '', /HttpOnly/)
    noUser.mock.restore()
    const { middleware } = await import('../src/middleware')
    const { NextRequest } = await import('next/server')
    assert.equal(middleware(new NextRequest('http://localhost/search-index.json')).status, 404)
    assert.match(middleware(new NextRequest('http://localhost/api/search')).headers.get('cache-control') ?? '', /private, no-store/)
    await setWikiDM(dm, true)
    await queries.deleteArchivedEntities([secret.id], dm)
    assert.equal(await queries.getEntityIncludingArchived(secret.id, true), null)

    const policies = await pool.query(`SELECT c.relname, c.relrowsecurity, p.polpermissive
      FROM pg_class c LEFT JOIN pg_policy p ON p.polrelid = c.oid
      WHERE c.relnamespace = pg_my_temp_schema() AND c.relname IN ('entities', 'entity_relations', 'knowledge_chunks', 'ingestion_jobs', 'wiki_dms')`)
    assert.equal(policies.rows.length, 5)
    assert.ok(policies.rows.every(row => row.relrowsecurity && (row.relname === 'wiki_dms' || row.polpermissive === false)))
    assert.equal(existsSync('public/search-index.json'), false)
    console.log('Spoilers: reads, writes, favorites, archives, atomic batches, HTTP authorization, DM revocation and RLS passed')
  } finally {
    mock.restoreAll()
    await pool.query('ROLLBACK')
    await pool.end()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
