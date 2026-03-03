'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { AlertCircle, Loader2 } from 'lucide-react'
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

type CharacterStatus = 'active' | 'deceased' | 'unknown' | 'missing'

type CharacterFields = {
  race: string
  class: string
  status: CharacterStatus
  titles: string
  affiliation: string
  image: string
  alignment: string
  hierarchy: string
  abilities: string
  weaknesses: string
  combatAc: string
  combatHp: string
  combatSpeed: string
  combatAttacks: string
}

type PlaceFields = {
  region: string
  type: string
  climate: string
  population: string
  government: string
  function: string
  design: string
  notableLocations: string
  map: string
}

type FactionFields = {
  alignment: string
  domains: string
  portfolio: string
  headquarters: string
  leader: string
  goals: string
}

type ItemFields = {
  rarity: string
  type: string
  attunement: boolean
  properties: string
  effects: string
}

type LoreFields = {
  category: string
  era: string
  dogma: string
  proverbs: string
  significance: string
}

type MonsterFields = {
  cr: string
  size: string
  type: string
  alignment: string
  environment: string
  abilities: string
}

type DataFields = {
  character: CharacterFields
  place: PlaceFields
  faction: FactionFields
  item: ItemFields
  lore: LoreFields
  monster: MonsterFields
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') return {}
  return value as Record<string, unknown>
}

function getString(obj: Record<string, unknown>, key: string): string {
  const value = obj[key]
  return typeof value === 'string' ? value : ''
}

function getStringArray(obj: Record<string, unknown>, key: string): string[] {
  const value = obj[key]
  if (!Array.isArray(value)) return []
  return value.filter((x): x is string => typeof x === 'string')
}

function getBool(obj: Record<string, unknown>, key: string): boolean {
  return obj[key] === true
}

function toCommaList(values: string[]): string {
  return values.join(', ')
}

function parseCommaList(input: string): string[] {
  return input
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

function buildInitialFields(type: EntityType, data: Record<string, unknown>): DataFields[keyof DataFields] {
  if (type === 'character') {
    const combat = asRecord(data.combat)
    const statusRaw = getString(data, 'status')
    const allowed: CharacterStatus[] = ['active', 'deceased', 'unknown', 'missing']

    return {
      race: getString(data, 'race'),
      class: getString(data, 'class'),
      status: allowed.includes(statusRaw as CharacterStatus) ? (statusRaw as CharacterStatus) : 'unknown',
      titles: toCommaList(getStringArray(data, 'titles')),
      affiliation: getString(data, 'affiliation'),
      image: getString(data, 'image'),
      alignment: getString(data, 'alignment'),
      hierarchy: toCommaList(getStringArray(data, 'hierarchy')),
      abilities: toCommaList(getStringArray(data, 'abilities')),
      weaknesses: toCommaList(getStringArray(data, 'weaknesses')),
      combatAc: typeof combat.ac === 'number' ? String(combat.ac) : '',
      combatHp: typeof combat.hp === 'string' ? combat.hp : '',
      combatSpeed: typeof combat.speed === 'string' ? combat.speed : '',
      combatAttacks: toCommaList(Array.isArray(combat.attacks) ? combat.attacks.filter((x): x is string => typeof x === 'string') : []),
    } satisfies CharacterFields
  }

  if (type === 'place') {
    return {
      region: getString(data, 'region'),
      type: getString(data, 'type'),
      climate: getString(data, 'climate'),
      population: getString(data, 'population'),
      government: getString(data, 'government'),
      function: getString(data, 'function'),
      design: getString(data, 'design'),
      notableLocations: toCommaList(getStringArray(data, 'notableLocations')),
      map: getString(data, 'map'),
    } satisfies PlaceFields
  }

  if (type === 'faction') {
    return {
      alignment: getString(data, 'alignment'),
      domains: toCommaList(getStringArray(data, 'domains')),
      portfolio: toCommaList(getStringArray(data, 'portfolio')),
      headquarters: getString(data, 'headquarters'),
      leader: getString(data, 'leader'),
      goals: toCommaList(getStringArray(data, 'goals')),
    } satisfies FactionFields
  }

  if (type === 'item') {
    return {
      rarity: getString(data, 'rarity'),
      type: getString(data, 'type'),
      attunement: getBool(data, 'attunement'),
      properties: toCommaList(getStringArray(data, 'properties')),
      effects: toCommaList(getStringArray(data, 'effects')),
    } satisfies ItemFields
  }

  if (type === 'lore') {
    return {
      category: getString(data, 'category'),
      era: getString(data, 'era'),
      dogma: toCommaList(getStringArray(data, 'dogma')),
      proverbs: toCommaList(getStringArray(data, 'proverbs')),
      significance: getString(data, 'significance'),
    } satisfies LoreFields
  }

  if (type === 'monster') {
    return {
      cr: getString(data, 'cr'),
      size: getString(data, 'size'),
      type: getString(data, 'type'),
      alignment: getString(data, 'alignment'),
      environment: toCommaList(getStringArray(data, 'environment')),
      abilities: toCommaList(getStringArray(data, 'abilities')),
    } satisfies MonsterFields
  }

  // Default (should never happen for admin collections)
  return {
    category: '',
    era: '',
    dogma: '',
    proverbs: '',
    significance: '',
  } satisfies LoreFields
}

function assembleData(type: EntityType, fields: DataFields[keyof DataFields]): Record<string, unknown> {
  if (type === 'character') {
    const f = fields as CharacterFields
    const combatAc = f.combatAc.trim() ? Number.parseInt(f.combatAc.trim(), 10) : null

    return {
      race: f.race.trim() || undefined,
      class: f.class.trim() || undefined,
      status: f.status,
      titles: parseCommaList(f.titles),
      affiliation: f.affiliation.trim() || undefined,
      image: f.image.trim() || undefined,
      alignment: f.alignment.trim() || undefined,
      hierarchy: parseCommaList(f.hierarchy),
      abilities: parseCommaList(f.abilities),
      weaknesses: parseCommaList(f.weaknesses),
      combat: {
        ...(Number.isFinite(combatAc) ? { ac: combatAc } : {}),
        ...(f.combatHp.trim() ? { hp: f.combatHp.trim() } : {}),
        ...(f.combatSpeed.trim() ? { speed: f.combatSpeed.trim() } : {}),
        ...(parseCommaList(f.combatAttacks).length ? { attacks: parseCommaList(f.combatAttacks) } : {}),
      },
    }
  }

  if (type === 'place') {
    const f = fields as PlaceFields
    return {
      region: f.region.trim() || undefined,
      type: f.type.trim() || undefined,
      climate: f.climate.trim() || undefined,
      population: f.population.trim() || undefined,
      government: f.government.trim() || undefined,
      function: f.function.trim() || undefined,
      design: f.design.trim() || undefined,
      notableLocations: parseCommaList(f.notableLocations),
      map: f.map.trim() || undefined,
    }
  }

  if (type === 'faction') {
    const f = fields as FactionFields
    return {
      alignment: f.alignment.trim() || undefined,
      domains: parseCommaList(f.domains),
      portfolio: parseCommaList(f.portfolio),
      headquarters: f.headquarters.trim() || undefined,
      leader: f.leader.trim() || undefined,
      goals: parseCommaList(f.goals),
    }
  }

  if (type === 'item') {
    const f = fields as ItemFields
    return {
      rarity: f.rarity.trim() || undefined,
      type: f.type.trim() || undefined,
      attunement: f.attunement,
      properties: parseCommaList(f.properties),
      effects: parseCommaList(f.effects),
    }
  }

  if (type === 'lore') {
    const f = fields as LoreFields
    return {
      category: f.category.trim() || undefined,
      era: f.era.trim() || undefined,
      dogma: parseCommaList(f.dogma),
      proverbs: parseCommaList(f.proverbs),
      significance: f.significance.trim() || undefined,
    }
  }

  if (type === 'monster') {
    const f = fields as MonsterFields
    return {
      cr: f.cr.trim() || undefined,
      size: f.size.trim() || undefined,
      type: f.type.trim() || undefined,
      alignment: f.alignment.trim() || undefined,
      environment: parseCommaList(f.environment),
      abilities: parseCommaList(f.abilities),
    }
  }

  return {}
}

function buildContextSummary(type: EntityType, fields: DataFields[keyof DataFields]): string {
  const lines: string[] = []

  function push(label: string, value: string) {
    const v = value.trim()
    if (!v) return
    lines.push(`${label}: ${v}`)
  }

  function pushBool(label: string, value: boolean) {
    if (!value) return
    lines.push(`${label}: yes`)
  }

  if (type === 'character') {
    const f = fields as CharacterFields
    push('Race', f.race)
    push('Class', f.class)
    push('Status', f.status)
    push('Titles', f.titles)
    push('Affiliation', f.affiliation)
    push('Image', f.image)
    push('Alignment', f.alignment)
    push('Hierarchy', f.hierarchy)
    push('Abilities', f.abilities)
    push('Weaknesses', f.weaknesses)
    push('Combat AC', f.combatAc)
    push('Combat HP', f.combatHp)
    push('Combat Speed', f.combatSpeed)
    push('Combat Attacks', f.combatAttacks)
  }

  if (type === 'place') {
    const f = fields as PlaceFields
    push('Region', f.region)
    push('Type', f.type)
    push('Climate', f.climate)
    push('Population', f.population)
    push('Government', f.government)
    push('Function', f.function)
    push('Design', f.design)
    push('Notable locations', f.notableLocations)
    push('Map', f.map)
  }

  if (type === 'faction') {
    const f = fields as FactionFields
    push('Alignment', f.alignment)
    push('Domains', f.domains)
    push('Portfolio', f.portfolio)
    push('Headquarters', f.headquarters)
    push('Leader', f.leader)
    push('Goals', f.goals)
  }

  if (type === 'item') {
    const f = fields as ItemFields
    push('Rarity', f.rarity)
    push('Type', f.type)
    pushBool('Attunement', f.attunement)
    push('Properties', f.properties)
    push('Effects', f.effects)
  }

  if (type === 'lore') {
    const f = fields as LoreFields
    push('Category', f.category)
    push('Era', f.era)
    push('Dogma', f.dogma)
    push('Proverbs', f.proverbs)
    push('Significance', f.significance)
  }

  if (type === 'monster') {
    const f = fields as MonsterFields
    push('CR', f.cr)
    push('Size', f.size)
    push('Type', f.type)
    push('Alignment', f.alignment)
    push('Environment', f.environment)
    push('Abilities', f.abilities)
  }

  return lines.join('\n')
}

export type AdminEntityFormValues = {
  id?: string
  type: EntityType
  name: string
  slug: string
  description: string
  status: EntityStatus
  data?: Record<string, unknown>
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
  const [dataFields, setDataFields] = useState<DataFields[keyof DataFields]>(
    buildInitialFields(initial.type, initial.data ?? {})
  )

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isMagicPenLoading, setIsMagicPenLoading] = useState(false)
  const [magicPenError, setMagicPenError] = useState<string | null>(null)
  const [magicPenSuccessStage, setMagicPenSuccessStage] = useState<'hidden' | 'shown' | 'fading'>('hidden')

  const canAutoSlug = useMemo(() => mode === 'create', [mode])

  function update<K extends keyof AdminEntityFormValues>(key: K, value: AdminEntityFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function updateDataField(key: string, value: string | boolean) {
    setDataFields((prev) => ({
      ...(prev as Record<string, unknown>),
      [key]: value,
    }) as DataFields[keyof DataFields])
  }

  async function onMagicPen() {
    setIsMagicPenLoading(true)
    setMagicPenError(null)

    try {
      const context = buildContextSummary(values.type, dataFields)

      const res = await fetch('/api/admin/magic-pen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          type: values.type,
          description: values.description.trim() ? values.description.trim() : undefined,
          context,
        }),
      })

      if (!res.ok) {
        const out = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(out?.error ?? 'Magic Pen request failed.')
      }

      const out = (await res.json()) as { result?: string }
      const result = (out.result ?? '').trim()
      if (!result) throw new Error('Magic Pen returned an empty result.')

      update('description', result)

      setMagicPenSuccessStage('shown')
      setTimeout(() => setMagicPenSuccessStage('fading'), 2000)
      setTimeout(() => setMagicPenSuccessStage('hidden'), 2400)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setMagicPenError(message)
    } finally {
      setIsMagicPenLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    setIsSaving(true)
    setError(null)

    const payload = {
      type: values.type,
      name: values.name.trim(),
      slug: values.slug.trim(),
      description: values.description.trim(),
      status: values.status,
      data: assembleData(values.type, dataFields),
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
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <button
            type="button"
            onClick={onMagicPen}
            disabled={isMagicPenLoading || !values.name.trim()}
            className="inline-flex shrink-0 items-center gap-2 rounded bg-amber-500/15 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 disabled:opacity-60"
            title={values.description.trim() ? 'Enhance in Thaveus\'s voice' : 'Generate a draft in Thaveus\'s voice'}
          >
            {isMagicPenLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Writing…</span>
              </>
            ) : (
              <>
                <Icon icon="game-icons:quill-ink" className="h-4 w-4" />
                <span>Magic Pen</span>
              </>
            )}
          </button>
        </div>
        <textarea
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className="mt-1 w-full min-h-24 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        {magicPenSuccessStage !== 'hidden' ? (
          <div
            className={`mt-2 inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900 transition-opacity duration-300 ${
              magicPenSuccessStage === 'shown' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Written by Thaveus ✓
          </div>
        ) : null}
        {magicPenError ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{magicPenError}</span>
          </p>
        ) : null}
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

      {/* Typed data fields */}
      {values.type === 'character' ? (
        <div className="rounded border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Character details</h3>

          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Image URL</span>
              <input
                value={(dataFields as CharacterFields).image}
                onChange={(e) => updateDataField('image', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">Identity</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Race</span>
                  <input
                    value={(dataFields as CharacterFields).race}
                    onChange={(e) => updateDataField('race', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Class</span>
                  <input
                    value={(dataFields as CharacterFields).class}
                    onChange={(e) => updateDataField('class', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Alignment</span>
                  <input
                    value={(dataFields as CharacterFields).alignment}
                    onChange={(e) => updateDataField('alignment', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Status</span>
                  <select
                    value={(dataFields as CharacterFields).status}
                    onChange={(e) => updateDataField('status', e.target.value as CharacterStatus)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="active">active</option>
                    <option value="deceased">deceased</option>
                    <option value="unknown">unknown</option>
                    <option value="missing">missing</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">Lore</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Titles (comma-separated)</span>
                  <input
                    value={(dataFields as CharacterFields).titles}
                    onChange={(e) => updateDataField('titles', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Affiliation</span>
                  <input
                    value={(dataFields as CharacterFields).affiliation}
                    onChange={(e) => updateDataField('affiliation', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Hierarchy (comma-separated)</span>
                  <input
                    value={(dataFields as CharacterFields).hierarchy}
                    onChange={(e) => updateDataField('hierarchy', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
              </div>
            </div>

            <div className="rounded border border-slate-200 bg-slate-50 p-3">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">Traits</h4>
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Abilities (comma-separated)</span>
                  <input
                    value={(dataFields as CharacterFields).abilities}
                    onChange={(e) => updateDataField('abilities', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Weaknesses (comma-separated)</span>
                  <input
                    value={(dataFields as CharacterFields).weaknesses}
                    onChange={(e) => updateDataField('weaknesses', e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3">
            <h4 className="mb-2 text-sm font-semibold text-slate-800">Combat</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">AC</span>
                <input
                  inputMode="numeric"
                  value={(dataFields as CharacterFields).combatAc}
                  onChange={(e) => updateDataField('combatAc', e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">HP</span>
                <input
                  value={(dataFields as CharacterFields).combatHp}
                  onChange={(e) => updateDataField('combatHp', e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Speed</span>
                <input
                  value={(dataFields as CharacterFields).combatSpeed}
                  onChange={(e) => updateDataField('combatSpeed', e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Attacks (comma-separated)</span>
                <input
                  value={(dataFields as CharacterFields).combatAttacks}
                  onChange={(e) => updateDataField('combatAttacks', e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {values.type === 'place' ? (
        <div className="rounded border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Place details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ['region', 'Region'],
                ['type', 'Type'],
                ['climate', 'Climate'],
                ['population', 'Population'],
                ['government', 'Government'],
                ['function', 'Function'],
                ['design', 'Design'],
                ['map', 'Map URL'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  value={(dataFields as any)[key] as string}
                  onChange={(e) => updateDataField(key, e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
            ))}

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Notable locations (comma-separated)</span>
              <input
                value={(dataFields as PlaceFields).notableLocations}
                onChange={(e) => updateDataField('notableLocations', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      {values.type === 'faction' ? (
        <div className="rounded border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Faction details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Alignment</span>
              <input
                value={(dataFields as FactionFields).alignment}
                onChange={(e) => updateDataField('alignment', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Headquarters</span>
              <input
                value={(dataFields as FactionFields).headquarters}
                onChange={(e) => updateDataField('headquarters', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Leader</span>
              <input
                value={(dataFields as FactionFields).leader}
                onChange={(e) => updateDataField('leader', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Domains (comma-separated)</span>
              <input
                value={(dataFields as FactionFields).domains}
                onChange={(e) => updateDataField('domains', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Portfolio (comma-separated)</span>
              <input
                value={(dataFields as FactionFields).portfolio}
                onChange={(e) => updateDataField('portfolio', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Goals (comma-separated)</span>
              <input
                value={(dataFields as FactionFields).goals}
                onChange={(e) => updateDataField('goals', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      {values.type === 'item' ? (
        <div className="rounded border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Item details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Rarity</span>
              <input
                value={(dataFields as ItemFields).rarity}
                onChange={(e) => updateDataField('rarity', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Type</span>
              <input
                value={(dataFields as ItemFields).type}
                onChange={(e) => updateDataField('type', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={(dataFields as ItemFields).attunement}
                onChange={(e) => updateDataField('attunement', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-700">Requires attunement</span>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Properties (comma-separated)</span>
              <input
                value={(dataFields as ItemFields).properties}
                onChange={(e) => updateDataField('properties', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Effects (comma-separated)</span>
              <input
                value={(dataFields as ItemFields).effects}
                onChange={(e) => updateDataField('effects', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      {values.type === 'lore' ? (
        <div className="rounded border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Lore details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Category</span>
              <input
                value={(dataFields as LoreFields).category}
                onChange={(e) => updateDataField('category', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Era</span>
              <input
                value={(dataFields as LoreFields).era}
                onChange={(e) => updateDataField('era', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Dogma (comma-separated)</span>
              <input
                value={(dataFields as LoreFields).dogma}
                onChange={(e) => updateDataField('dogma', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Proverbs (comma-separated)</span>
              <input
                value={(dataFields as LoreFields).proverbs}
                onChange={(e) => updateDataField('proverbs', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Significance</span>
              <input
                value={(dataFields as LoreFields).significance}
                onChange={(e) => updateDataField('significance', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      {values.type === 'monster' ? (
        <div className="rounded border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Monster details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ['cr', 'CR'],
                ['size', 'Size'],
                ['type', 'Type'],
                ['alignment', 'Alignment'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  value={(dataFields as any)[key] as string}
                  onChange={(e) => updateDataField(key, e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
            ))}

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Environment (comma-separated)</span>
              <input
                value={(dataFields as MonsterFields).environment}
                onChange={(e) => updateDataField('environment', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Abilities (comma-separated)</span>
              <input
                value={(dataFields as MonsterFields).abilities}
                onChange={(e) => updateDataField('abilities', e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <button
          disabled={isSaving}
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
