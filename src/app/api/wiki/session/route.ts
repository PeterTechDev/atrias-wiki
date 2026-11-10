import { NextResponse } from 'next/server'
import { classifyWikiMember } from '@/lib/wikiAuth'
import { wikiSessionCookie } from '@/lib/wikiRequest'

export async function PUT(req: Request) {
  if (req.headers.get('origin') !== new URL(req.url).origin) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 })
  }
  const lookup = await classifyWikiMember(req)
  if (lookup.state === 'unavailable') {
    return NextResponse.json(
      { authenticated: false, reason: 'unavailable' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }
  const user = lookup.state === 'member' ? lookup.user : null
  const response = NextResponse.json({ authenticated: Boolean(user) }, { headers: { 'Cache-Control': 'private, no-store' } })
  response.cookies.set(wikiSessionCookie, user ? req.headers.get('authorization')!.slice(7).trim() : '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: user ? 3600 : 0,
  })
  return response
}
