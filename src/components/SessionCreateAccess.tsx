import Link from 'next/link'

export function sessionCreateView(loading: boolean, user: unknown): 'loading' | 'wall' | 'form' {
  if (loading) return 'loading'
  return user ? 'form' : 'wall'
}

export function SessionCreateWall() {
  return (
    <div className="rounded border border-amber-300 bg-amber-50 px-5 py-4 text-amber-950">
      <p>Entre para criar e editar páginas.</p>
      <Link href="/login?next=/sessions/new" className="mt-3 inline-block font-semibold text-amber-800 underline">Entrar / Criar conta</Link>
    </div>
  )
}
