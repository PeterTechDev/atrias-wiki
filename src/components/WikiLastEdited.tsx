import { supabase } from '@/lib/supabase'
import type { Entity } from '@/db/schema'

async function editorName(entity: Pick<Entity, 'updatedBy' | 'updatedBySource'>) {
  if (entity.updatedBySource !== 'member' || !entity.updatedBy) return 'Autoria não registrada'

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', entity.updatedBy)
    .maybeSingle()

  if (error) {
    console.error('Failed to load wiki editor profile:', error)
    return 'Autor indisponível'
  }
  return data?.display_name || 'Usuário removido'
}

export async function WikiLastEdited({ entity }: { entity: Pick<Entity, 'updatedAt' | 'updatedBy' | 'updatedBySource'> & { isSpoiler?: boolean | null } }) {
  const date = new Date(entity.updatedAt)
  const name = await editorName(entity)
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Bahia',
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date)

  return (
    <div className="mt-8 border-t border-amber-300/50 pt-6 text-sm text-slate-500">
      {entity.isSpoiler && <p className="mb-3 font-semibold text-amber-800">🔒 Spoiler / Restrito ao DM</p>}
      <span>Última alteração por {name} em </span>
      <time dateTime={date.toISOString()}>{formatted} (America/Bahia)</time>
    </div>
  )
}
