import { NextResponse } from 'next/server'
import { searchEntities } from '@/db/queries/search'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const query = new URL(req.url).searchParams.get('q') ?? ''
  return NextResponse.json(await searchEntities(query))
}
