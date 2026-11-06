import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { visibleAccount } from '../src/lib/headerAccount'
import { syncWikiSession } from '../src/lib/wikiSession'

const member = { id: 'member', is_anonymous: false }
assert.equal(visibleAccount(null), null)
assert.equal(visibleAccount(undefined), null)
assert.equal(visibleAccount({ id: 'anon', is_anonymous: true }), null)
assert.equal(visibleAccount(member), member)

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const authProvider = readFileSync(join(root, 'src/components/AuthProvider.tsx'), 'utf8')
const callback = authProvider.slice(authProvider.indexOf('onAuthStateChange'), authProvider.indexOf('subscription.unsubscribe'))
const loadingAt = callback.indexOf('setLoading(false)')
const syncAt = callback.indexOf('syncWikiSession')
assert.ok(loadingAt !== -1 && syncAt !== -1 && loadingAt < syncAt, 'o header precisa sair de carregando antes da sincronização da sessão')
assert.match(callback, /visibleAccount\(session\?\.user\)/)
assert.match(authProvider, /headerAccountTimeoutMessage/)

const originalFetch = globalThis.fetch

function hangUntilAbort(_input: unknown, init?: { signal?: AbortSignal }) {
  return new Promise<Response>((_resolve, reject) => {
    const signal = init?.signal
    if (!signal) return
    if (signal.aborted) reject(signal.reason)
    else signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  })
}

async function withDeadline<T>(promise: Promise<T>, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error('test deadline')), ms)
  })
  try {
    return await Promise.race([promise, deadline])
  } finally {
    clearTimeout(timer)
  }
}

async function main() {
  globalThis.fetch = hangUntilAbort as typeof fetch
  await assert.rejects(
    withDeadline(syncWikiSession(null, 30), 1000),
    (error: unknown) => error instanceof Error && /sincronizar a sessão/.test(error.message) && !/test deadline/.test(error.message),
  )

  let continued = false
  globalThis.fetch = (async () => {
    continued = true
    return { ok: true, json: async () => ({ authenticated: false }) }
  }) as unknown as typeof fetch
  const started = Date.now()
  await syncWikiSession(null, 1000)
  assert.equal(continued, true)
  assert.ok(Date.now() - started < 500, 'uma sincronização anterior que falhou não pode prender a próxima')

  globalThis.fetch = (async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch
  await assert.rejects(syncWikiSession({ access_token: 'token' }, 1000), /sincronizar a sessão/)

  globalThis.fetch = (async () => ({ ok: true, json: async () => ({ authenticated: false }) })) as unknown as typeof fetch
  await assert.rejects(syncWikiSession({ access_token: 'expired' }, 1000), /Sua sessão expirou/)

  console.log('header auth: anonymous account resolves without waiting on a stalled session sync')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
}).finally(() => {
  globalThis.fetch = originalFetch
})
