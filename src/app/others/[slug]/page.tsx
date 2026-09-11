import { WikiText } from '@/components/WikiText'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEntityBySlug } from '@/db/queries/entities'
import { WikiContributionActions } from '@/components/WikiContributionActions'
import { WikiLastEdited } from '@/components/WikiLastEdited'

export const dynamic = 'force-dynamic'

export default async function OtherPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entity = await getEntityBySlug('other', slug)
  if (!entity) notFound()
  return <main className="min-h-screen bg-[#e8dcc8] px-6 py-8 text-slate-800"><article className="mx-auto max-w-4xl"><Link href="/others" className="text-amber-800 hover:underline">← Outros</Link><div className="mt-6 rounded-lg bg-white/80 p-8 shadow-lg"><h1 className="font-cinzel text-4xl">{entity.name}</h1><div className="mt-6 whitespace-pre-wrap text-lg text-slate-700"><WikiText text={entity.description || 'Registro sem descrição.'} /></div><WikiLastEdited entity={entity} /><div className="mt-4 flex justify-end"><WikiContributionActions collection="others" slug={slug} entityId={entity.id} enabled={process.env.WIKI_EDITING_ENABLED !== 'false'} /></div></div></article></main>
}
