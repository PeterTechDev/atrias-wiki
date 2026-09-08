import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, type EntityStatus } from '@/db/schema'
import { EntityWriteError, updateEntity } from '@/db/queries/entities'

type UpdateEntityBody = {
  name?: string
  slug?: string
  description?: string
  status?: EntityStatus
  data?: Record<string, unknown>
  revision?: number
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

    const updated = await updateEntity({ id, ...body }, { source: 'admin' })
    return NextResponse.json({ id: updated.id }, { status: 200 })
  } catch (error) {
    if (error instanceof EntityWriteError) {
      const status = error.code === 'invalid' ? 400 : error.code === 'not_found' ? 404 : 409
      return NextResponse.json({ error: error.message }, { status })
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
