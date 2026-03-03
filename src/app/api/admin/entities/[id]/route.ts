import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, type EntityStatus } from '@/db/schema'

type UpdateEntityBody = {
  name?: string
  slug?: string
  description?: string
  status?: EntityStatus
  data?: Record<string, unknown>
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = (await req.json()) as UpdateEntityBody

    if (!id) {
      return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
    }

    const updated = await db
      .update(entities)
      .set({
        name: body.name,
        slug: body.slug,
        description: body.description ?? null,
        status: body.status,
        data: body.data,
        updatedAt: new Date(),
      })
      .where(eq(entities.id, id))
      .returning({ id: entities.id })

    if (!updated[0]) {
      return NextResponse.json({ error: 'Entity not found.' }, { status: 404 })
    }

    return NextResponse.json({ id: updated[0].id }, { status: 200 })
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : ''

    if (message.includes('duplicate key') || message.includes('unique') || message.includes('entities_slug')) {
      return NextResponse.json({ error: 'Slug already exists.' }, { status: 409 })
    }

    console.error(`PATCH /api/admin/entities/${id} failed:`, error)
    return NextResponse.json({ error: 'Failed to update entity.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    if (!id) {
      return NextResponse.json({ error: 'Missing id.' }, { status: 400 })
    }

    const deleted = await db
      .delete(entities)
      .where(eq(entities.id, id))
      .returning({ id: entities.id })

    if (!deleted[0]) {
      return NextResponse.json({ error: 'Entity not found.' }, { status: 404 })
    }

    return NextResponse.json({ id: deleted[0].id }, { status: 200 })
  } catch (error) {
    console.error(`DELETE /api/admin/entities/${id} failed:`, error)
    return NextResponse.json({ error: 'Failed to delete entity.' }, { status: 500 })
  }
}
