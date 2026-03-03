import { NextResponse } from 'next/server'
import { db } from '@/db'
import { entities, type EntityStatus, type EntityType } from '@/db/schema'

type CreateEntityBody = {
  type: EntityType
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

    const created = await db
      .insert(entities)
      .values({
        type: body.type,
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        status: body.status ?? 'published',
        data: body.data ?? {},
      })
      .returning({ id: entities.id })

    return NextResponse.json({ id: created[0]?.id }, { status: 201 })
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : ''

    // Unique constraint on slug
    if (message.includes('duplicate key') || message.includes('unique') || message.includes('entities_slug')) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 })
    }

    console.error('POST /api/admin/entities failed:', error)
    return NextResponse.json({ error: 'Failed to create entity.' }, { status: 500 })
  }
}
