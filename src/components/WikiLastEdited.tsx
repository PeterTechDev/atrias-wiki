import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Entity } from '@/db/schema'

async function editorName(entity: Pick<Entity, 'updatedBy'>) {
  if (!entity.updatedBy) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', entity.updatedBy)
    .maybeSingle()

  if (error) {
    console.error('Failed to load wiki editor profile:', error)
    return 'Autor indisponível'
  }
  return data?.display_name?.trim() || null
}

export async function WikiLastEdited({ entity }: { entity: Pick<Entity, 'createdAt' | 'updatedAt' | 'updatedBy' | 'revision'> & { isSpoiler?: boolean | null } }) {
  const created = entity.revision === 1
  const date = new Date(created ? entity.createdAt : entity.updatedAt)
  const name = await editorName(entity)
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Bahia',
    dateStyle: 'long',
  }).format(date)

  return (
    <div className="mt-8 border-t border-amber-300/50 pt-6 text-sm text-slate-500">
      {entity.isSpoiler && <p className="mb-3 font-semibold text-amber-800">🔒 Spoiler / Restrito ao DM</p>}
      <span>{created ? 'Criado' : 'Alterado'} em </span>
      <time dateTime={date.toISOString()}>{formatted}</time>
      <span> por {name ?? <Link href="/characters/thaveus" className="underline hover:text-amber-800">Thaveus</Link>}.</span>
    </div>
  )
}
