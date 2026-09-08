import { NextResponse } from 'next/server'
import { getWikiMember } from '@/lib/wikiAuth'
import { wikiSessionCookie } from '@/lib/wikiRequest'

export async function PUT(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 })
  }
  const user = await getWikiMember(req)
  const response = NextResponse.json({ authenticated: Boolean(user) }, { headers: { 'Cache-Control': 'private, no-store' } })
  response.cookies.set(wikiSessionCookie, user ? req.headers.get('authorization')!.slice(7).trim() : '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: user ? 3600 : 0,
  })
  return response
}
