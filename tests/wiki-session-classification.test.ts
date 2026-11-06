import assert from 'node:assert/strict'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:9'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_isolated_simulation'
process.env.DATABASE_URL = 'postgresql://atrias:atrias_dev@127.0.0.1:5432/atrias_wiki'

const origin = 'http://127.0.0.1:9'
const goTrueUser = `${origin}/auth/v1/user`
const originalFetch = globalThis.fetch

type GoTrueMode = 'member' | 'anonymous' | 'unauthorized' | 'session-expired' | 'unavailable' | 'network' | 'rate-limit' | 'rate-limit-plain' | 'sms-limit' | 'timeout'

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
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'X-Supabase-Api-Version': '2024-01-01' },
  })
}

function goTrueResponse() {
  if (mode === 'network') throw new TypeError('Failed to fetch')
  if (mode === 'unavailable') return jsonResponse(503, { message: 'upstream unavailable' })
  if (mode === 'rate-limit') return jsonResponse(429, { code: 'over_request_rate_limit', message: 'Rate limit exceeded' })
  if (mode === 'rate-limit-plain') return jsonResponse(429, { message: 'Too many requests' })
  if (mode === 'sms-limit') return jsonResponse(400, { code: 'over_sms_send_rate_limit', message: 'SMS rate limit exceeded' })
  if (mode === 'timeout') return jsonResponse(408, { code: 'request_timeout', message: 'Request timeout' })
  if (mode === 'unauthorized') return jsonResponse(401, { code: 'bad_jwt', message: 'invalid JWT' })
  if (mode === 'session-expired') return jsonResponse(401, { code: 'session_expired', message: 'Session expired' })
  if (mode === 'anonymous') return jsonResponse(200, { ...memberBody, is_anonymous: true })
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
  const { supabase } = await import('../src/lib/supabase')
  const { getWikiMember } = await import('../src/lib/wikiAuth')
  const { PUT } = await import('../src/app/api/wiki/session/route')
  const { syncWikiSession } = await import('../src/lib/wikiSession')

  mode = 'rate-limit'
  const rateLimited = await supabase.auth.getUser('simulated-token')
  assert.equal(rateLimited.error?.name, 'AuthApiError')
  assert.equal(rateLimited.error?.status, 429)
  assert.equal(rateLimited.error?.code, 'over_request_rate_limit')
  mode = 'timeout'
  const timedOut = await supabase.auth.getUser('simulated-token')
  assert.equal(timedOut.error?.name, 'AuthApiError')
  assert.equal(timedOut.error?.status, 408)
  assert.equal(timedOut.error?.code, 'request_timeout')

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

  const missing = new Request(`${origin}/api/wiki/session`, { method: 'PUT', headers: { origin } })
  assert.equal(await getWikiMember(missing), null)
  const absent = await PUT(missing)
  assert.equal(absent.status, 200)
  assert.deepEqual(await absent.json(), { authenticated: false })
  assert.match(absent.headers.get('set-cookie') ?? '', /Max-Age=0/)

  mode = 'anonymous'
  assert.equal(await getWikiMember(sessionRequest()), null)
  const anonymous = await PUT(sessionRequest())
  assert.equal(anonymous.status, 200)
  assert.deepEqual(await anonymous.json(), { authenticated: false })
  assert.match(anonymous.headers.get('set-cookie') ?? '', /Max-Age=0/)

  mode = 'session-expired'
  assert.equal(await getWikiMember(sessionRequest()), null)
  const expiredSession = await PUT(sessionRequest())
  assert.equal(expiredSession.status, 200, 'session_expired continua rejeição confirmada')
  assert.deepEqual(await expiredSession.json(), { authenticated: false })
  assert.match(expiredSession.headers.get('set-cookie') ?? '', /Max-Age=0/)

  for (const transient of ['rate-limit', 'rate-limit-plain', 'sms-limit', 'timeout'] as const) {
    mode = transient
    assert.equal(await getWikiMember(sessionRequest()), null, `${transient} não autentica nem promove papel`)
    const response = await PUT(sessionRequest())
    assert.equal(response.status, 503, `${transient} do GoTrue não pode virar sessão rejeitada`)
    assert.deepEqual(await response.json(), { authenticated: false, reason: 'unavailable' })
    assert.equal(response.headers.get('set-cookie'), null, `${transient} não apaga o cookie`)
  }

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
  assert.match(await syncError('session-expired'), /Sua sessão expirou\. Entre novamente\./)
  assert.match(await syncError('anonymous'), /Sua sessão expirou\. Entre novamente\./)
  assert.match(await syncError('rate-limit'), /Não foi possível sincronizar a sessão/)
  assert.doesNotMatch(await syncError('rate-limit'), /Sua sessão expirou/)
  assert.match(await syncError('rate-limit-plain'), /Não foi possível sincronizar a sessão/)
  assert.doesNotMatch(await syncError('rate-limit-plain'), /Sua sessão expirou/)
  assert.match(await syncError('sms-limit'), /Não foi possível sincronizar a sessão/)
  assert.doesNotMatch(await syncError('sms-limit'), /Sua sessão expirou/)
  assert.match(await syncError('timeout'), /Não foi possível sincronizar a sessão/)
  assert.doesNotMatch(await syncError('timeout'), /Sua sessão expirou/)
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

  console.log('wiki session: 503/rede/429/408 ficam indisponíveis; 401, ausência e anônimo ficam rejeição')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
}).finally(() => {
  globalThis.fetch = originalFetch
})
