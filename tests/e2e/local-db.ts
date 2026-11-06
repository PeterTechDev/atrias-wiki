import { Client } from 'pg'

// Dedicated local database. Abrigo de Solária is absent from import-output/entities.json,
// so the deep link needs one place row. This refuses any host that is not loopback and
// any database other than the ephemeral e2e database. It does not touch a remote wiki.
const ephemeralRole = 'atrias_e2e'
const ephemeralDatabase = 'atrias_wiki_e2e'

export function localMapDatabaseUrl() {
  if (process.env.MAP_E2E_DATABASE_URL) return process.env.MAP_E2E_DATABASE_URL
  const password = process.env.MAP_E2E_DB_PASSWORD
  if (!password) {
    throw new Error(
      'Defina MAP_E2E_DB_PASSWORD ou MAP_E2E_DATABASE_URL para a role local atrias_e2e. Veja tests/e2e/README.md.'
    )
  }
  const url = new URL(`postgres://${ephemeralRole}@127.0.0.1:5432/${ephemeralDatabase}`)
  url.password = password
  return url.toString()
}

const ABRIGO = {
  slug: 'abrigo-de-solaria',
  name: 'Abrigo de Solária',
} as const

export function assertLocalMapDatabase(connectionString: string) {
  const url = new URL(connectionString)
  const host = url.hostname
  if (host !== '127.0.0.1' && host !== 'localhost') {
    throw new Error(`Recusando escrita de teste: host ${host} não é local.`)
  }
  if (url.pathname !== '/atrias_wiki_e2e') {
    throw new Error(`Recusando escrita de teste: banco ${url.pathname} não é o banco efêmero do mapa.`)
  }
  return url
}

export async function ensureLocalMapFixture(connectionString = localMapDatabaseUrl()) {
  assertLocalMapDatabase(connectionString)
  const client = new Client({ connectionString })
  await client.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS entities (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        type text NOT NULL,
        slug text NOT NULL UNIQUE,
        name text NOT NULL,
        description text,
        image text,
        data jsonb DEFAULT '{}'::jsonb,
        embedding text,
        is_spoiler boolean DEFAULT false,
        status text DEFAULT 'published',
        source_file text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by uuid,
        updated_by_source text NOT NULL DEFAULT 'legacy',
        revision integer NOT NULL DEFAULT 1,
        archived_at timestamptz
      )
    `)
    // Name and slug are the marker already declared in src/lib/mapLocations.ts.
    // data is {} so mapMarker stays undefined and the static link matches the slug.
    // No editorial description is invented here.
    await client.query(
      `INSERT INTO entities (type, slug, name, description, data, is_spoiler, status, archived_at)
       VALUES ('place', $1, $2, NULL, '{}'::jsonb, false, 'published', NULL)
       ON CONFLICT (slug) DO UPDATE SET
         type = EXCLUDED.type,
         name = EXCLUDED.name,
         description = NULL,
         data = EXCLUDED.data,
         is_spoiler = false,
         archived_at = NULL`,
      [ABRIGO.slug, ABRIGO.name]
    )
  } finally {
    await client.end()
  }
}
