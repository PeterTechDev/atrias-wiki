'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function logout() {
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
        <Link href="/login" className="flex min-w-0 items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-amber-400">
          <Avatar value={user.user_metadata.avatar} />
          <span className="max-w-40 truncate">{user.user_metadata.display_name || 'Meu perfil'}</span>
        </Link>
        <button onClick={logout} disabled={busy} className="rounded border border-amber-200/40 px-4 py-2 hover:bg-amber-100/10 disabled:opacity-50">{busy ? 'Saindo…' : 'Sair'}</button>
      </> : <Link href="/login" className="rounded border border-amber-200/40 px-4 py-2 hover:bg-amber-100/10">Entrar / Criar conta</Link>}
      {error && <p role="alert" className="w-full text-right text-red-300">{error}</p>}
    </nav>
    {children}
  </AuthContext.Provider>
}
