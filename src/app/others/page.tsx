import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getEntitiesByType } from '@/db/queries/entities'
import { WikiContributionActions } from '@/components/WikiContributionActions'

export const dynamic = 'force-dynamic'

export default async function OthersPage() {
  const entities = await getEntitiesByType('other')
  return <main className="min-h-screen bg-[#e8dcc8] px-6 py-8 text-slate-800"><div className="mx-auto max-w-6xl"><Link href="/browse" className="text-amber-800 hover:underline">← Arquivos</Link><div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white/80 p-6 shadow-lg"><div><h1 className="font-cinzel text-4xl">Outros</h1><p className="mt-2 text-slate-600">Registros que não se encaixam nas outras categorias.</p></div><WikiContributionActions collection="others" enabled={process.env.WIKI_EDITING_ENABLED !== 'false'} /></div>{entities.length ? <div className="mt-6 grid gap-4 md:grid-cols-2">{entities.map((entity) => <Link key={entity.id} href={`/others/${entity.slug}`} className="rounded-lg bg-white/80 p-5 shadow hover:ring-2 hover:ring-amber-400"><h2 className="font-cinzel text-xl">{entity.name}</h2><p className="mt-2 line-clamp-3 text-slate-600">{entity.description || 'Registro sem descrição.'}</p></Link>)}</div> : <div className="mt-10 text-center text-slate-600"><Icon icon="game-icons:archive-register" className="mx-auto h-12 w-12" /><p className="mt-3">Nenhum registro encontrado.</p></div>}</div></main>
}
