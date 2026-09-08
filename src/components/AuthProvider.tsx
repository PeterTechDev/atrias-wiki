'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { avatars, authError, supabase, supabaseUrl } from '@/lib/supabase'

const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true })
export const useAuth = () => useContext(AuthContext)

export function Avatar({ value }: { value?: string }) {
  if (value?.startsWith(`${supabaseUrl}/storage/v1/object/public/avatars/`)) {
    return <Image src={value} alt="Foto de perfil" width={40} height={40} unoptimized className="h-10 w-10 rounded-full object-cover" />
  }
  return <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-100/10 text-2xl" aria-label={avatars.find(a => a.id === value)?.label || 'Mago'}>{avatars.find(a => a.id === value)?.symbol || '🧙'}</span>
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user && !session.user.is_anonymous ? session.user : null)
      setMenuPath(null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

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
    <nav aria-label="Conta" className="relative z-40 flex min-h-16 flex-wrap items-center justify-end gap-3 border-b border-amber-200/10 bg-[#0a1628] px-4 py-2 text-sm text-amber-100 sm:px-6">
      {loading ? <span role="status">Carregando conta…</span> : user ? <>
        <Link href="/wiki/archived" className="rounded border border-amber-200/40 px-3 py-2 hover:bg-amber-100/10">Páginas arquivadas</Link>
        <div ref={menuRef} className="relative">
        <button ref={triggerRef} type="button" aria-expanded={menuOpen} aria-controls="account-menu" onClick={() => setMenuOpen(!menuOpen)} className="flex min-w-0 items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-amber-400">
          <Avatar value={user.user_metadata.avatar} />
          <span className="max-w-40 truncate">{user.user_metadata.display_name || 'Meu perfil'}</span>
        </button>
        {menuOpen && <div id="account-menu" className="absolute right-0 top-full z-50 mt-2 w-44 rounded border border-amber-200/30 bg-[#0a1628] p-1 shadow-xl"><Link href="/login" onClick={() => setMenuPath(null)} className="block rounded px-3 py-2 hover:bg-amber-100/10">Meu perfil</Link><Link href="/wiki/favorites" onClick={() => setMenuPath(null)} className="block rounded px-3 py-2 hover:bg-amber-100/10">Favoritos</Link></div>}
        </div>
        <button onClick={logout} disabled={busy} className="rounded border border-amber-200/40 px-4 py-2 hover:bg-amber-100/10 disabled:opacity-50">{busy ? 'Saindo…' : 'Sair'}</button>
      </> : <Link href="/login" className="rounded border border-amber-200/40 px-4 py-2 hover:bg-amber-100/10">Entrar / Criar conta</Link>}
      {error && <p role="alert" className="w-full text-right text-red-300">{error}</p>}
    </nav>
    {children}
  </AuthContext.Provider>
}
