import assert from 'node:assert/strict'
import { mock } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { WikiLastEdited } from '../src/components/WikiLastEdited'
import { supabase } from '../src/lib/supabase'

async function main() {
  let profile: { display_name: string } | null = { display_name: 'Peter' }
  const lookup = mock.method(supabase, 'from', () => ({
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile, error: null }) }) }),
  }))
  const entity = {
    createdAt: new Date('2026-09-11T01:26:58.631Z'),
    updatedAt: new Date('2026-09-11T02:46:23.693Z'),
    updatedBy: 'deb3afcc-385f-4657-8bff-9d86515e3d97',
    updatedBySource: 'admin' as const,
    revision: 6,
  }
  const render = async (overrides = {}) => renderToStaticMarkup(await WikiLastEdited({ entity: { ...entity, ...overrides } }))
  try {
    assert.match(await render(), /Alterado em <\/span><time dateTime="2026-09-11T02:46:23.693Z">10 de setembro de 2026<\/time><span> por Peter\./)
    assert.match(await render({ revision: 1 }), /Criado em <\/span><time dateTime="2026-09-11T01:26:58.631Z">10 de setembro de 2026/)
    assert.match(await render({ updatedBySource: 'member' }), /por Peter\./)
    const calls = lookup.mock.callCount()
    assert.match(await render({ updatedBy: null, updatedBySource: 'legacy' }), /href="\/characters\/thaveus"[^>]*>Thaveus<\/a>/)
    assert.equal(lookup.mock.callCount(), calls)
    profile = null
    assert.match(await render(), />Thaveus<\/a>/)
    console.log('wiki last edited: ok')
  } finally {
    mock.restoreAll()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
