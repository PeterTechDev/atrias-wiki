'use client'

import { Fragment, createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { avatars, authError, supabase, supabaseUrl } from '@/lib/supabase'
import { syncWikiSession } from '@/lib/wikiSession'
import GlobalSearch from '@/components/GlobalSearch'

const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true })
export const useAuth = () => useContext(AuthContext)

export function Avatar({ value, size = 40 }: { value?: string; size?: number }) {
  if (value?.startsWith(`${supabaseUrl}/storage/v1/object/public/avatars/`)) {
    return <Image src={value} alt="Foto de perfil" width={size} height={size} unoptimized className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  }
  const avatar = avatars.find(a => a.id === value) || avatars[0]
  return <Image src={`/avatars/${avatar.id}.svg`} alt={avatar.label} width={size} height={size} className="shrink-0 rounded-full bg-amber-100/5 p-1.5" />
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pathname = usePathname()
  const [menuPath, setMenuPath] = useState<string | null>(null)
  if (menuPath !== null && menuPath !== pathname) setMenuPath(null)
  const menuOpen = menuPath === pathname
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setMenuPath(null)
      void syncWikiSession(session).then(() => {
        if (!active) return
        if (_event === 'SIGNED_OUT') { window.location.replace('/'); return }
        setUser(session?.user && !session.user.is_anonymous ? session.user : null)
        router.refresh()
      }).catch(error => {
        if (active) { setUser(null); setError(error instanceof Error ? error.message : 'Não foi possível carregar a sessão.') }
      }).finally(() => { if (active) setLoading(false) })
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [router])

  useEffect(() => {
    function close(event: MouseEvent) { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuPath(null) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) { if (event.key === 'Escape' && menuOpen) { setMenuPath(null); triggerRef.current?.focus() } }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  async function logout() {
    setMenuPath(null)
    setBusy(true)
    setError('')
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw error
    } catch (error) {
      setError(authError(error))
    } finally {
      setBusy(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading }}>
    <header className="relative z-40 border-b border-amber-200/10 bg-[#0a1628] text-sm text-amber-100">
    <nav aria-label="Navegação principal" className="mx-auto flex min-h-16 max-w-6xl items-center gap-3 px-4 py-2 sm:gap-6 sm:px-6">
      <Link href="/" aria-label="Wiki Átrias — início" className="mr-auto flex shrink-0 items-center gap-2 rounded text-amber-400 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400">
        <Icon icon="game-icons:book-cover" aria-hidden="true" className="h-6 w-6" />
        <span className="font-cinzel text-sm sm:text-lg">Wiki Átrias</span>
      </Link>
      <GlobalSearch key={user?.id ?? 'visitor'} />
      {loading ? <span role="status">Carregando conta…</span> : user ? <>
        <div ref={menuRef} className="relative">
        <button ref={triggerRef} type="button" aria-label={`Menu da conta: ${user.user_metadata.display_name || 'Meu perfil'}`} aria-expanded={menuOpen} aria-controls="account-menu" onClick={() => setMenuOpen(!menuOpen)} className="group flex min-h-11 min-w-0 items-center gap-2 rounded px-1 hover:bg-amber-100/10 focus-visible:outline-2 focus-visible:outline-amber-400">
          <Avatar value={user.user_metadata.avatar} />
          <span className="sr-only sm:not-sr-only sm:max-w-20 sm:truncate lg:max-w-40">{user.user_metadata.display_name || 'Meu perfil'}</span>
          <ChevronDown aria-hidden="true" size={14} className="shrink-0 text-amber-100/70 group-aria-expanded:rotate-180" />
        </button>
        {menuOpen && <div id="account-menu" className="absolute right-0 top-full z-50 mt-2 w-44 rounded border border-amber-200/30 bg-[#0a1628] p-1 shadow-xl"><Link href="/login" onClick={() => setMenuPath(null)} className="block rounded px-3 py-2 hover:bg-amber-100/10">Meu perfil</Link><Link href="/wiki/favorites" onClick={() => setMenuPath(null)} className="block rounded px-3 py-2 hover:bg-amber-100/10">Favoritos</Link><Link href="/wiki/archived" onClick={() => setMenuPath(null)} className="block rounded px-3 py-2 hover:bg-amber-100/10">Páginas arquivadas</Link><button onClick={logout} disabled={busy} className="block w-full rounded px-3 py-2 text-left hover:bg-amber-100/10 disabled:opacity-50">{busy ? 'Saindo…' : 'Sair'}</button></div>}
        </div>
      </> : <Link href="/login" className="inline-flex min-h-11 shrink-0 items-center rounded border border-amber-200/40 px-3 py-2 hover:bg-amber-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">Entrar</Link>}
    </nav>
      {error && <p role="alert" className="mx-auto max-w-6xl px-6 pb-2 text-right text-red-300">{error}</p>}
    </header>
    <Fragment key={user?.id ?? 'visitor'}>{children}</Fragment>
  </AuthContext.Provider>
}
