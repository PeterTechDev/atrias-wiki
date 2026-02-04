import { NextRequest, NextResponse } from 'next/server'
import { searchEntities } from '@/db/queries/search'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    const results = await searchEntities(query)
    return NextResponse.json(results)
  } catch (error) {
    const errorId = crypto.randomUUID().slice(0, 8)

    console.error('Search error:', {
      errorId,
      query,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    return NextResponse.json(
      {
        error: 'Search is temporarily unavailable. Please try again.',
        errorId,
      },
      { status: 500 }
    )
  }
}
