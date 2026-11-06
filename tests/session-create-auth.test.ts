import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mock } from 'node:test'
import { getWikiMember } from '../src/lib/wikiAuth'
import { supabase } from '../src/lib/supabase'
import { handleSessionSave, sessionSaveHeaders } from '../src/lib/sessionSave'

const validBody = {
  campaign: 'Campanha Principal',
  sessionNumber: 42,
  playDate: '2026-11-06',
  title: 'A Queda de Solaria',
  summary: 'O grupo atravessou a ponte.',
  keyEvents: ['A ponte caiu'],
  quotes: [],
  cliffhanger: '',
  matchedEntities: [],
}

function request(body: unknown, authorization?: string) {
  return new Request('http://localhost/api/sessions/save', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(authorization ? { authorization } : {}),
    },
    body: JSON.stringify(body),
  })
}

async function main() {
  const getUser = mock.method(supabase.auth, 'getUser', async () => {
    throw new Error('anonymous create must not contact the auth service')
  })

  let persisted = 0
  const anonymous = await handleSessionSave(request(validBody), {
    getMember: getWikiMember,
    persist: async () => {
      persisted += 1
      return { id: 'should-not-exist', slug: 'should-not-exist' }
    },
  })

  assert.equal(anonymous.status, 401)
  assert.deepEqual(await anonymous.json(), { error: 'Authentication required.' })
  assert.equal(persisted, 0)
  assert.equal(getUser.mock.callCount(), 0, 'missing bearer must fail before any auth lookup')

  const emptyBearer = await getWikiMember(request(validBody, 'Bearer '))
  assert.equal(emptyBearer, null)
  assert.equal(getUser.mock.callCount(), 0)

  const member = { id: 'member-1' }
  let saved: unknown = null
  const created = await handleSessionSave(request(validBody), {
    getMember: async () => member,
    persist: async (record) => {
      saved = record
      persisted += 1
      return { id: 'session-1', slug: record.slug }
    },
  })
  assert.equal(created.status, 200)
  assert.deepEqual(await created.json(), { id: 'session-1', slug: 'campanha-principal-42' })
  assert.equal(persisted, 1)
  assert.equal((saved as { slug: string }).slug, 'campanha-principal-42')

  const invalid = await handleSessionSave(request({ campaign: '' }), {
    getMember: async () => member,
    persist: async () => {
      persisted += 1
      throw new Error('invalid payload must not persist')
    },
  })
  assert.equal(invalid.status, 400)
  assert.equal(persisted, 1)

  const expired = sessionSaveHeaders(null)
  assert.deepEqual(expired, { error: 'Sua sessão expirou. Entre novamente e tente salvar.' })
  const headers = sessionSaveHeaders(' token ')
  assert.equal('headers' in headers && headers.headers.authorization, 'Bearer token')

  const route = readFileSync('src/app/api/sessions/save/route.ts', 'utf8')
  const post = route.slice(route.indexOf('export async function POST'))
  assert.match(post, /handleSessionSave/)
  assert.match(post, /getWikiMember/)
  assert.doesNotMatch(post, /db\.insert/, 'POST must not insert; persistence stays behind the auth handler')

  console.log('session create auth: anonymous save is rejected before persistence')
  getUser.mock.restore()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
