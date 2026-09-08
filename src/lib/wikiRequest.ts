import { cache } from 'react'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { isWikiDM, entityVisibility } from '@/lib/wikiPermissions'

export const wikiSessionCookie = 'wiki-access-token'

export const getWikiRequestUser = cache(async () => {
  const token = (await cookies()).get(wikiSessionCookie)?.value
  if (!token) return null
  const { data, error } = await supabase.auth.getUser(token)
  return error || data.user?.is_anonymous ? null : data.user
})

export const getWikiRequestDM = cache(async () => isWikiDM((await getWikiRequestUser())?.id))

export async function readVisibility(isDM?: boolean) {
  return entityVisibility(isDM ?? await getWikiRequestDM())
}
