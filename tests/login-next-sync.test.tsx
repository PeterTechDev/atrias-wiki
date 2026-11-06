import assert from 'node:assert/strict'
import { mock } from 'node:test'
import { Window } from 'happy-dom'
import type { Session, User } from '@supabase/supabase-js'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:9'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_isolated_simulation'
process.env.DATABASE_URL = 'postgresql://atrias:atrias_dev@127.0.0.1:5432/atrias_wiki'

const origin = 'http://127.0.0.1:9'
const dom = new Window({ url: `${origin}/login?next=/wiki/favorites` })
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

const redirects: string[] = []
dom.location.replace = ((url: string | URL) => { redirects.push(String(url)) }) as typeof dom.location.replace

type AuthListener = (event: string, session: Pick<Session, 'access_token' | 'user'> | null) => void
const listeners: AuthListener[] = []
const originalFetch = globalThis.fetch
const goTrueUser = `${origin}/auth/v1/user`

type GoTrueMode = 'member' | 'unauthorized' | 'unavailable' | 'network' | 'hang'
let mode: GoTrueMode = 'hang'
let releaseGoTrue: (value: Response | PromiseLike<Response>) => void = () => {}

function member(name: string): User {
  return {
    id: `sim-${name}`,
    aud: 'authenticated',
    app_metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
    is_anonymous: false,
    user_metadata: { display_name: name, avatar: 'mage' },
  }
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function goTrueResponse() {
  if (mode === 'hang') return new Promise<Response>(resolve => { releaseGoTrue = resolve })
  if (mode === 'network') throw new TypeError('Failed to fetch')
  if (mode === 'unavailable') return jsonResponse(503, { message: 'upstream unavailable' })
  if (mode === 'unauthorized') return jsonResponse(401, { message: 'invalid JWT', error_code: 'bad_jwt' })
  return jsonResponse(200, {
    id: 'member-sim',
    aud: 'authenticated',
    is_anonymous: false,
    app_metadata: {},
    user_metadata: { display_name: 'Conta Restaurada', avatar: 'mage' },
    created_at: '2026-01-01T00:00:00.000Z',
  })
}

async function main() {
  const { supabase } = await import('../src/lib/supabase')
  mock.method(supabase.auth, 'onAuthStateChange', (callback: AuthListener) => {
    listeners.push(callback)
    return { data: { subscription: { unsubscribe() {} } } }
  })
  const { PUT } = await import('../src/app/api/wiki/session/route')
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.startsWith(goTrueUser)) return goTrueResponse()
    if (url.includes('api.iconify.design') || url.includes('api.simplesvg.com') || url.includes('api.unisvg.com')) {
      return jsonResponse(404, {})
    }
    if (url === '/api/wiki/session') {
      const authorization = new Headers(init?.headers).get('authorization') ?? ''
      return PUT(new Request(`${origin}/api/wiki/session`, { method: 'PUT', headers: { origin, authorization } }))
    }
    throw new Error(`simulação não chama rede externa (${url})`)
  }) as typeof fetch

  const { act, createElement } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { AppRouterContext } = await import('next/dist/shared/lib/app-router-context.shared-runtime')
  const { PathnameContext } = await import('next/dist/shared/lib/hooks-client-context.shared-runtime')
  const { default: AuthProvider } = await import('../src/components/AuthProvider')
  const { default: LoginPage } = await import('../src/app/login/page')

  const refresh: string[] = []
  const router = {
    refresh() { refresh.push('refresh') },
    push() {},
    replace() {},
    back() {},
    forward() {},
    prefetch() {},
  }
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  try {
    await act(async () => {
      root.render(createElement(
        AppRouterContext.Provider,
        { value: router },
        createElement(PathnameContext.Provider, { value: '/login' }, createElement(AuthProvider, null, createElement(LoginPage))),
      ))
    })
    const listener = listeners.at(-1)
    assert.ok(listener)

    mode = 'hang'
    await act(async () => { listener('INITIAL_SESSION', { access_token: 'simulated-token', user: member('Conta Simulada') }) })
    assert.deepEqual(redirects, [], 'sessão local ainda não confirmada não redireciona /login?next')

    mode = 'unauthorized'
    await act(async () => {
      releaseGoTrue(goTrueResponse())
      await new Promise(resolve => setTimeout(resolve, 20))
    })
    const rejected = container.querySelector('header')?.innerHTML ?? ''
    assert.match(rejected, /Sua sessão expirou\. Entre novamente\./)
    assert.match(rejected, /href="\/login"[^>]*>Entrar</)
    assert.doesNotMatch(rejected, /Menu da conta/)
    assert.deepEqual(redirects, [], 'rejeição confirmada não segue next')
    assert.ok(refresh.includes('refresh'), 'rejeição confirmada atualiza o conteúdo do servidor')

    redirects.length = 0
    refresh.length = 0
    mode = 'unavailable'
    await act(async () => {
      listener('TOKEN_REFRESHED', { access_token: 'simulated-token', user: member('Conta Simulada') })
      await new Promise(resolve => setTimeout(resolve, 20))
    })
    const unavailable = container.querySelector('header')?.innerHTML ?? ''
    assert.match(unavailable, /Menu da conta: Conta Simulada/)
    assert.doesNotMatch(unavailable, /Sua sessão expirou/)
    assert.match(unavailable, /Não foi possível sincronizar a sessão/)
    assert.deepEqual(redirects, ['/wiki/favorites'], 'indisponibilidade mantém a conta e o destino pedido')

    dom.happyDOM.setURL(`${origin}/login?next=/wiki/favorites`)
    redirects.length = 0
    mode = 'member'
    await act(async () => {
      listener('SIGNED_IN', { access_token: 'fresh-token', user: member('Conta Restaurada') })
      await new Promise(resolve => setTimeout(resolve, 20))
    })
    assert.deepEqual(redirects, ['/wiki/favorites'], 'login confirmado segue next')
    assert.match(container.querySelector('header')?.innerHTML ?? '', /Menu da conta: Conta Restaurada/)

    dom.happyDOM.setURL(`${origin}/login`)
    redirects.length = 0
    mode = 'member'
    await act(async () => {
      listener('SIGNED_IN', { access_token: 'fresh-token', user: member('Conta Restaurada') })
      await new Promise(resolve => setTimeout(resolve, 20))
    })
    assert.deepEqual(redirects, [], 'entrar sem next não redireciona')

    console.log('login next: redirect espera a classificação real da sessão')
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
