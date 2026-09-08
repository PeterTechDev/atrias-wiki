import { NextResponse } from 'next/server'
import { createEntity, EntityWriteError, type WikiEntityType } from '@/db/queries/entities'
import type { EntityStatus } from '@/db/schema'

type CreateEntityBody = {
  type: WikiEntityType
  name: string
  slug: string
  description?: string
  status?: EntityStatus
  data?: Record<string, unknown>
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateEntityBody

    if (!body?.type || !body?.name || !body?.slug) {
      return NextResponse.json({ error: 'type, name, and slug are required.' }, { status: 400 })
    }
    const created = await createEntity(body, { source: 'admin' })
    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (error) {
    if (error instanceof EntityWriteError) {
      const status = error.code === 'invalid' ? 400 : error.code === 'duplicate' ? 409 : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    console.error('POST /api/admin/entities failed:', error)
    return NextResponse.json({ error: 'Failed to create entity.' }, { status: 500 })
  }
}
