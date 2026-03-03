'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import type { EntityStatus, EntityType } from '@/db/schema'
import { collectionLabels, isAdminCollection } from '../_lib/entityTypes'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export type AdminEntityFormValues = {
  id?: string
  type: EntityType
  name: string
  slug: string
  description: string
  status: EntityStatus
  dataText: string
}

export function AdminEntityForm({
  mode,
  collection,
  initial,
}: {
  mode: 'create' | 'edit'
  collection: string
  initial: AdminEntityFormValues
}) {
  const router = useRouter()
  const [values, setValues] = useState<AdminEntityFormValues>(initial)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canAutoSlug = useMemo(() => mode === 'create', [mode])

  const jsonInvalid = useMemo(() => {
    const text = values.dataText.trim()
    if (!text) return false
    try {
      JSON.parse(text)
      return false
    } catch {
      return true
    }
  }, [values.dataText])

  function update<K extends keyof AdminEntityFormValues>(key: K, value: AdminEntityFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (jsonInvalid) {
      setError('Invalid JSON')
      return
    }

    setIsSaving(true)
    setError(null)

    const data = values.dataText.trim() ? JSON.parse(values.dataText) : {}

    const payload = {
      type: values.type,
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description.trim(),
      status: values.status,
      data,
    }

    const url = mode === 'create' ? '/api/admin/entities' : `/api/admin/entities/${values.id}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const out = (await res.json().catch(() => null)) as { error?: string } | null
      setError(out?.error ?? 'Request failed.')
      setIsSaving(false)
      return
    }

    const success = mode === 'create' ? 'created' : 'updated'
    router.push(`/admin/${collection}?success=${success}`)
    router.refresh()
  }

  const label = isAdminCollection(collection) ? collectionLabels[collection] : collection

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <nav className="text-sm text-slate-600">
        <Link href="/admin" className="hover:underline">Admin</Link>
        <span className="mx-2 text-slate-400">→</span>
        <Link href={`/admin/${collection}`} className="hover:underline">{label}</Link>
        <span className="mx-2 text-slate-400">→</span>
        <span className="text-slate-800 font-semibold">{mode === 'create' ? 'New' : 'Edit'}</span>
      </nav>

      {error ? (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Name</span>
          <input
            value={values.name}
            onChange={(e) => {
              const name = e.target.value
              update('name', name)
              if (canAutoSlug) update('slug', slugify(name))
            }}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Slug</span>
          <input
            value={values.slug}
            onChange={(e) => update('slug', e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Description</span>
        <textarea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className="mt-1 w-full min-h-24 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Type</span>
          <input
            value={values.type}
            readOnly
            className="mt-1 w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Status</span>
          <select
            value={values.status}
            onChange={(e) => update('status', e.target.value as EntityStatus)}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="draft">draft</option>
            <option value="review">review</option>
            <option value="published">published</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Data (JSON)</span>
        <textarea
          value={values.dataText}
          onChange={(e) => update('dataText', e.target.value)}
          className={`mt-1 w-full min-h-56 rounded border bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
            jsonInvalid ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'
          }`}
          placeholder={'{\n  "status": "Vivo"\n}'}
        />
        {jsonInvalid ? (
          <p className="mt-2 text-sm text-red-700">Invalid JSON</p>
        ) : null}
      </label>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <button
          disabled={isSaving || jsonInvalid}
          className="inline-flex items-center justify-center gap-2 rounded bg-[#0a1628] px-4 py-2 text-sm font-semibold text-amber-300 hover:text-amber-200 disabled:opacity-60"
        >
          <Icon icon="game-icons:save" className="w-5 h-5" />
          {isSaving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Icon icon="game-icons:cancel" className="w-5 h-5" />
          Cancel
        </button>
      </div>
    </form>
  )
}
