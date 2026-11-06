import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:9'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_isolated_simulation'
process.env.DATABASE_URL = 'postgresql://atrias:atrias_dev@127.0.0.1:5432/atrias_wiki'

const origin = 'http://127.0.0.1:9'
const goTrueUser = `${origin}/auth/v1/user`
const originalFetch = globalThis.fetch

type GoTrueMode = 'member' | 'unauthorized' | 'unavailable' | 'network'

let mode: GoTrueMode = 'unauthorized'

const memberBody = {
  id: 'member-sim',
  aud: 'authenticated',
  role: 'authenticated',
  is_anonymous: false,
  app_metadata: {},
  user_metadata: { display_name: 'Conta Simulada', avatar: 'mage' },
  created_at: '2026-01-01T00:00:00.000Z',
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function goTrueResponse() {
  if (mode === 'network') throw new TypeError('Failed to fetch')
  if (mode === 'unavailable') return jsonResponse(503, { message: 'upstream unavailable' })
  if (mode === 'unauthorized') return jsonResponse(401, { message: 'invalid JWT', error_code: 'bad_jwt' })
  return jsonResponse(200, memberBody)
}

function installGoTrueFetch() {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.startsWith(goTrueUser)) return goTrueResponse()
    throw new Error(`simulação não chama rede externa (${url})`)
  }) as typeof fetch
}

function sessionRequest(token = 'simulated-token') {
  return new Request(`${origin}/api/wiki/session`, {
    method: 'PUT',
    headers: { origin, authorization: `Bearer ${token}` },
  })
}

async function main() {
  installGoTrueFetch()
  const { getWikiMember } = await import('../src/lib/wikiAuth')
  const { PUT } = await import('../src/app/api/wiki/session/route')
  const { syncWikiSession } = await import('../src/lib/wikiSession')

  mode = 'unavailable'
  assert.equal(await getWikiMember(sessionRequest()), null, '503 no GoTrue continua sem membro e sem promover papel')
  const unavailable = await PUT(sessionRequest())
  assert.equal(unavailable.status, 503, '503 do GoTrue não pode virar sessão rejeitada')
  assert.deepEqual(await unavailable.json(), { authenticated: false, reason: 'unavailable' })
  assert.equal(unavailable.headers.get('set-cookie'), null, 'falha transitória não apaga o cookie')

  mode = 'network'
  assert.equal(await getWikiMember(sessionRequest()), null)
  const network = await PUT(sessionRequest())
  assert.equal(network.status, 503, 'rede do GoTrue não pode virar sessão rejeitada')
  assert.deepEqual(await network.json(), { authenticated: false, reason: 'unavailable' })
  assert.equal(network.headers.get('set-cookie'), null)

  mode = 'unauthorized'
  assert.equal(await getWikiMember(sessionRequest()), null)
  const rejected = await PUT(sessionRequest())
  assert.equal(rejected.status, 200)
  assert.deepEqual(await rejected.json(), { authenticated: false })
  assert.match(rejected.headers.get('set-cookie') ?? '', /Max-Age=0/)

  mode = 'member'
  const accepted = await PUT(sessionRequest())
  const acceptedBody = await accepted.json()
  assert.equal(accepted.status, 200)
  assert.equal(acceptedBody.authenticated, true)
  assert.equal(acceptedBody.id, undefined, 'a rota de sessão não devolve o usuário')
  assert.match(accepted.headers.get('set-cookie') ?? '', /Max-Age=3600/)

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.startsWith(goTrueUser)) return goTrueResponse()
    if (url === '/api/wiki/session') {
      const authorization = new Headers(init?.headers).get('authorization') ?? ''
      return PUT(new Request(`${origin}/api/wiki/session`, { method: 'PUT', headers: { origin, authorization } }))
    }
    throw new Error(`simulação não chama rede externa (${url})`)
  }) as typeof fetch

  async function syncError(next: GoTrueMode) {
    mode = next
    try {
      await syncWikiSession({ access_token: 'simulated-token' })
    } catch (error) {
      assert.ok(error instanceof Error)
      return error.message
    }
    return ''
  }

  assert.match(await syncError('unavailable'), /Não foi possível sincronizar a sessão/)
  assert.doesNotMatch(await syncError('unavailable'), /Sua sessão expirou/)
  assert.match(await syncError('network'), /Não foi possível sincronizar a sessão/)
  assert.doesNotMatch(await syncError('network'), /Sua sessão expirou/)
  assert.match(await syncError('unauthorized'), /Sua sessão expirou\. Entre novamente\./)
  assert.equal(await syncError('member'), '')

  globalThis.fetch = (async () => { throw new TypeError('Failed to fetch') }) as typeof fetch
  try {
    await syncWikiSession({ access_token: 'simulated-token' })
    assert.fail('falha de rede até /api/wiki/session precisa rejeitar a sincronização')
  } catch (error) {
    assert.ok(error instanceof Error)
    assert.match(error.message, /Não foi possível sincronizar a sessão/)
    assert.doesNotMatch(error.message, /Failed to fetch/)
  }

  console.log('wiki session: GoTrue 503/rede fica indisponível e 401 fica rejeição')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
}).finally(() => {
  globalThis.fetch = originalFetch
})
