import { NextResponse } from 'next/server'
import { getEntitiesByType } from '@/db/queries/entities'

// The existing /api/admin middleware protects this endpoint; admin is not a DM grant.
export async function GET() {
  const characters = await getEntitiesByType('character')
  return NextResponse.json(characters.map(({ name, slug }) => ({ name, slug })), { headers: { 'Cache-Control': 'private, no-store' } })
}
