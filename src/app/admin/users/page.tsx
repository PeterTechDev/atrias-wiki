import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { wikiDMs } from '@/db/schema'
import { supabase } from '@/lib/supabase'
import { isWikiAdmin } from '@/lib/wikiAdmin'
import { AdminShell } from '../_components/AdminShell'
import { DMPermissions } from './permissions'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  if (!isWikiAdmin(new Request('http://localhost', { headers: await headers() }))) notFound()
  // ponytail: up to 1000 members; paginate when the table grows beyond one campaign.
  const [{ data, error }, dms] = await Promise.all([
    supabase.from('profiles').select('id, display_name').order('display_name').range(0, 999),
    db.select().from(wikiDMs),
  ])
  if (error) throw new Error('Não foi possível carregar os usuários.')
  const dmIds = new Set(dms.map(dm => dm.userId))
  const users = (data ?? []).map(user => ({ id: user.id as string, name: user.display_name as string, isDM: dmIds.has(user.id) }))
  for (const dm of dms) if (!users.some(user => user.id === dm.userId)) users.push({ id: dm.userId, name: 'Usuário fora da listagem', isDM: true })
  return <AdminShell title="Permissões de mestre" subtitle="DMs podem ler posts restritos e alterar a classificação ao editar." backHref="/admin" backLabel="Voltar ao painel"><DMPermissions users={users} /></AdminShell>
}
