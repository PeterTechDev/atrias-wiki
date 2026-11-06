import assert from 'node:assert/strict'
import { mock } from 'node:test'
import { Window } from 'happy-dom'
import type { Session, User } from '@supabase/supabase-js'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:9'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_isolated_simulation'

const dom = new Window({ url: 'https://wiki.test/browse' })
const browserGlobals: Record<string, unknown> = {
  window: dom,
  document: dom.document,
  HTMLElement: dom.HTMLElement,
  SVGElement: dom.SVGElement,
  Element: dom.Element,
  Node: dom.Node,
  DocumentFragment: dom.DocumentFragment,
  navigator: dom.navigator,
  MutationObserver: dom.MutationObserver,
  getComputedStyle: dom.getComputedStyle.bind(dom),
  requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(() => callback(Date.now()), 0),
  cancelAnimationFrame: (id: number) => clearTimeout(id),
  self: globalThis,
  IS_REACT_ACT_ENVIRONMENT: true,
}
for (const [key, value] of Object.entries(browserGlobals)) {
  Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
}

type AuthListener = (event: string, session: Pick<Session, 'access_token' | 'user'> | null) => void

const listeners: AuthListener[] = []
const originalFetch = globalThis.fetch

function member(name: string): User {
  return {
    id: `sim-${name}`,
    is_anonymous: false,
    user_metadata: { display_name: name, avatar: 'mage' },
  } as User
}

function sessionFor(name: string, token: string) {
  return { access_token: token, user: member(name) }
}

type SessionResponse = { ok: boolean; authenticated?: boolean; fail?: 'network' }

let sessionResponse: SessionResponse = { ok: true, authenticated: true }

function installFetch() {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('api.iconify.design') || url.includes('api.simplesvg.com') || url.includes('api.unisvg.com')) {
      return { ok: false, json: async () => ({}) } as Response
    }
    assert.equal(url, '/api/wiki/session', `simulação isolada não chama rede externa (${url})`)
    if (sessionResponse.fail === 'network') throw new TypeError('Failed to fetch')
    return {
      ok: sessionResponse.ok,
      json: async () => ({ authenticated: sessionResponse.authenticated ?? false }),
    } as Response
  }) as typeof fetch
}

async function main() {
  installFetch()
  const { supabase } = await import('../src/lib/supabase')
  mock.method(supabase.auth, 'onAuthStateChange', (callback: AuthListener) => {
    listeners.push(callback)
    return { data: { subscription: { unsubscribe() {} } } }
  })
  const { act, createElement } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { AppRouterContext } = await import('next/dist/shared/lib/app-router-context.shared-runtime')
  const { PathnameContext } = await import('next/dist/shared/lib/hooks-client-context.shared-runtime')
  const { default: AuthProvider } = await import('../src/components/AuthProvider')

  const router = { refresh() {}, push() {}, replace() {}, back() {}, forward() {}, prefetch() {} }
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  try {

  await act(async () => {
    root.render(createElement(
      AppRouterContext.Provider,
      { value: router },
      createElement(PathnameContext.Provider, { value: '/browse' }, createElement(AuthProvider, null, createElement('main', null, 'conteúdo'))),
    ))
  })

  const listener = listeners.at(-1)
  assert.ok(listener, 'a simulação precisa observar a sessão sem chamar o provedor real')

  async function publish(event: string, session: ReturnType<typeof sessionFor> | null) {
    await act(async () => {
      listener!(event, session)
      await new Promise(resolve => setTimeout(resolve, 20))
    })
  }

  function header() {
    return container.querySelector('header')?.innerHTML ?? ''
  }

  sessionResponse = { ok: true, authenticated: false }
  await publish('INITIAL_SESSION', sessionFor('Conta Simulada', 'expired-token'))
  const expired = header()
  assert.match(expired, /Sua sessão expirou\. Entre novamente\./, 'alerta de expiração')
  assert.match(expired, /href="\/login"[^>]*>Entrar</, 'caminho de novo login')
  assert.doesNotMatch(expired, /Menu da conta/, 'expiração confirmada não apresenta menu de conta válida')
  assert.doesNotMatch(expired, /Conta Simulada/, 'expiração confirmada não apresenta a conta')
  assert.doesNotMatch(expired, /Carregando conta/, 'expiração confirmada não fica em loading')

  sessionResponse = { ok: false }
  await publish('INITIAL_SESSION', sessionFor('Conta Simulada', 'offline-token'))
  const offline = header()
  assert.match(offline, /Não foi possível sincronizar a sessão/, 'falha de sincronização continua visível')
  assert.match(offline, /Menu da conta: Conta Simulada/, 'falha transitória de sincronização mantém a conta')
  assert.doesNotMatch(offline, /Sua sessão expirou/, 'falha de sincronização não vira expiração')
  assert.doesNotMatch(offline, /Carregando conta/, 'falha de sincronização não fica em loading')

  sessionResponse = { ok: false, fail: 'network' }
  await publish('TOKEN_REFRESHED', sessionFor('Conta Simulada', 'network-token'))
  const network = header()
  assert.match(network, /Menu da conta: Conta Simulada/, 'falha transitória de rede mantém a conta')
  assert.doesNotMatch(network, /Sua sessão expirou/, 'falha de rede não vira expiração')
  assert.doesNotMatch(network, /Carregando conta/, 'falha de rede não fica em loading')

  sessionResponse = { ok: true, authenticated: true }
  await publish('SIGNED_IN', sessionFor('Conta Restaurada', 'fresh-token'))
  const restored = header()
  assert.match(restored, /Menu da conta: Conta Restaurada/, 'novo login restaura a conta')
  assert.doesNotMatch(restored, /Sua sessão expirou/, 'novo login limpa o aviso de expiração')
  assert.doesNotMatch(restored, /Não foi possível sincronizar a sessão/, 'novo login limpa o aviso de sincronização')
  assert.doesNotMatch(restored, /Carregando conta/, 'novo login não fica em loading')

  let sessionCalls = 0
  let releaseStale: (value: Response) => void = () => {}
  const stale = new Promise<Response>(resolve => { releaseStale = resolve })
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input)
    if (url.includes('api.iconify.design') || url.includes('api.simplesvg.com') || url.includes('api.unisvg.com')) {
      return { ok: false, json: async () => ({}) } as Response
    }
    assert.equal(url, '/api/wiki/session')
    sessionCalls += 1
    if (sessionCalls === 1) return stale
    return { ok: true, json: async () => ({ authenticated: true }) } as Response
  }) as typeof fetch
  await act(async () => { listener!('SIGNED_IN', sessionFor('Conta Antiga', 'stale-token')) })
  await act(async () => { listener!('SIGNED_IN', sessionFor('Conta Atual', 'current-token')) })
  await act(async () => {
    releaseStale({ ok: true, json: async () => ({ authenticated: false }) } as Response)
    await stale
    await new Promise(resolve => setTimeout(resolve, 20))
  })
  const current = header()
  assert.match(current, /Menu da conta: Conta Atual/, 'resposta atrasada de expiração não apaga o login mais novo')
  assert.doesNotMatch(current, /Sua sessão expirou/, 'resposta atrasada de expiração não reabre o aviso')
  assert.doesNotMatch(current, /Conta Antiga/)
  assert.doesNotMatch(current, /Carregando conta/)

  console.log('header session: expiração confirmada, falha transitória e novo login simulados')
  } finally {
    await act(async () => { root.unmount() })
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
}).finally(async () => {
  globalThis.fetch = originalFetch
  await dom.happyDOM.abort()
  process.exit(process.exitCode ?? 0)
})
