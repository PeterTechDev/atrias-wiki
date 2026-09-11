'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { EntityStatus, EntityType } from '@/db/schema'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { CharacterMediaEditor } from '@/components/CharacterMediaEditor'
import { CharacterCardEditor } from '@/components/CharacterCardEditor'
import { getCharacterCard, validateCharacterCard, type CharacterCard } from '@/lib/characterCard'
import { WikiTextEditor } from '@/components/WikiTextEditor'
import { useUnsavedChanges } from '@/components/useUnsavedChanges'
import { PlaceEditor } from '@/components/PlaceEditor'
import type { PlaceData } from '@/types/entities'
import { getPlaceContent, getPlaceMaps, validatePlaceData } from '@/lib/placeContent'
import { getPlaceMarker } from '@/lib/mapLocations'
import { getCharacterMedia, validateCharacterMedia, type CharacterMedia } from '@/lib/characterMedia'
import { entityTypeToCollection } from '../_lib/entityTypes'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 160)
    .replace(/-$/, '')
}

type CharacterFields = {
  race: string
  class: string
  status: string
  titles: string
  affiliation: string
  media: CharacterMedia[]
  card3d: CharacterCard | null
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
} & Omit<PlaceData, 'notableLocations'>

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

type OtherFields = Record<string, never>

type DataFields = {
  character: CharacterFields
  place: PlaceFields
  faction: FactionFields
  item: ItemFields
  lore: LoreFields
  monster: MonsterFields
  other: OtherFields
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

function buildInitialFields(type: EntityType, data: Record<string, unknown>, image?: string | null, description = '', slug = ''): DataFields[keyof DataFields] {
  if (type === 'character') {
    const combat = asRecord(data.combat)
    const statusRaw = getString(data, 'status')

    return {
      race: getString(data, 'race'),
      class: getString(data, 'class'),
      status: statusRaw || 'unknown',
      titles: toCommaList(getStringArray(data, 'titles')),
      affiliation: getString(data, 'affiliation'),
      media: getCharacterMedia(data, image),
      card3d: getCharacterCard(data.card3d),
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
      notableLocations: getStringArray(data, 'notableLocations').join('\n'),
      map: getString(data, 'map'),
      media: getCharacterMedia(data, image),
      maps: getPlaceMaps(data as PlaceData),
      sections: getPlaceContent(data as PlaceData, description).sections,
      residents: (data as PlaceData).residents ?? [],
      mapMarker: getPlaceMarker(data as PlaceData, slug)?.id ?? null,
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

  if (type === 'other') return {} satisfies OtherFields

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
      media: f.media,
      card3d: f.card3d,
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
      region: f.region.trim(),
      type: f.type.trim(),
      climate: f.climate.trim(),
      population: f.population.trim(),
      government: f.government.trim(),
      function: f.function.trim(),
      design: f.design.trim(),
      notableLocations: f.notableLocations.split('\n').map(item => item.trim()).filter(Boolean),
      map: f.map.trim() || undefined,
      media: f.media,
      maps: f.maps,
      sections: f.sections,
      residents: f.residents,
      mapMarker: f.mapMarker,
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

  if (type === 'other') return {}

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
  image?: string | null
  id?: string
  type: EntityType
  name: string
  slug: string
  description: string
  status: EntityStatus
  revision?: number
  isSpoiler?: boolean
  data?: Record<string, unknown>
}

export function AdminEntityForm({
  mode,
  collection,
  initial,
  audience = 'admin',
  enabled = true,
  isDM = false,
}: {
  mode: 'create' | 'edit'
  collection: string
  initial: AdminEntityFormValues
  audience?: 'admin' | 'member'
  enabled?: boolean
  isDM?: boolean
}) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [values, setValues] = useState<AdminEntityFormValues>(() => initial.type === 'place' ? { ...initial, description: getPlaceContent(initial.data as PlaceData ?? {}, initial.description).intro } : initial)
  const [dataFields, setDataFields] = useState<DataFields[keyof DataFields]>(
    buildInitialFields(initial.type, initial.data ?? {}, initial.image, initial.description, initial.slug)
  )
  const fieldsByType = useRef(new Map<EntityType, DataFields[keyof DataFields]>([[initial.type, buildInitialFields(initial.type, initial.data ?? {}, initial.image, initial.description, initial.slug)]]))

  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const addressRef = useRef<HTMLDetailsElement>(null)
  const [slugEdited, setSlugEdited] = useState(false)
  const [created, setCreated] = useState(false)
  const successRef = useRef<HTMLHeadingElement>(null)
  const memberCreate = audience === 'member' && mode === 'create'

  useEffect(() => {
    if (error && !isSaving) errorRef.current?.focus()
  }, [error, isSaving])
  useEffect(() => {
    if (created) successRef.current?.focus()
  }, [created])

  const [isMagicPenLoading, setIsMagicPenLoading] = useState(false)
  const [original] = useState(() => JSON.stringify({ values, dataFields }))
  const { allowLeave, markSaved } = useUnsavedChanges(
    original !== JSON.stringify({ values, dataFields }) || isUploading || isMagicPenLoading
  )
  const [magicPenError, setMagicPenError] = useState<string | null>(null)
  const [magicPenSuccessStage, setMagicPenSuccessStage] = useState<'hidden' | 'shown' | 'fading'>('hidden')

  const canAutoSlug = mode === 'create' && !slugEdited

  function update<K extends keyof AdminEntityFormValues>(key: K, value: AdminEntityFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  function updateDataField(key: string, value: string | boolean | CharacterMedia[] | CharacterCard | null) {
    setDataFields((prev) => {
      const next = {
      ...(prev as Record<string, unknown>),
      [key]: value,
      } as DataFields[keyof DataFields]
      fieldsByType.current.set(values.type, next)
      return next
    })
  }

  function changeType(type: EntityType) {
    fieldsByType.current.set(values.type, dataFields)
    const fields = fieldsByType.current.get(type) ?? buildInitialFields(type, {})
    fieldsByType.current.set(type, fields)
    update('type', type)
    setDataFields(fields)
    setError(null)
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
    if (isUploading || isSaving || created) return
    setError(null)
    if (values.type === 'place') {
      try { validatePlaceData(assembleData('place', dataFields)) }
      catch (error) { if (detailsRef.current) detailsRef.current.open = true; setError(error instanceof Error ? error.message : 'Revise o lugar.'); return }
    }

    if (values.type === 'character') {
      try {
        validateCharacterMedia((dataFields as CharacterFields).media)
        validateCharacterCard((dataFields as CharacterFields).card3d)
      }
      catch (error) { if (detailsRef.current) detailsRef.current.open = true; setError(error instanceof Error ? error.message : 'Revise as mídias.'); return }
    }

    setIsSaving(true)
    setError(null)

    try {
      const payload = audience === 'member'
        ? {
            ...(mode === 'create' ? { type: values.type, slug: values.slug.trim() } : {}),
            name: values.name.trim(),
            description: values.description.trim(),
            ...(isDM ? { isSpoiler: values.isSpoiler === true } : {}),
            data: assembleData(values.type, dataFields),
            ...(mode === 'edit' ? { revision: values.revision } : {}),
          }
        : {
            type: values.type,
            name: values.name.trim(),
            slug: values.slug.trim(),
            description: values.description.trim(),
            status: values.status,
            ...(isDM ? { isSpoiler: values.isSpoiler === true } : {}),
            data: assembleData(values.type, dataFields),
            ...(values.revision ? { revision: values.revision } : {}),
          }

      let headers: HeadersInit = { 'content-type': 'application/json' }
      if (audience === 'member') {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          setError('Sua sessão expirou. Entre novamente e tente salvar.')
          setIsSaving(false)
          return
        }
        headers = { ...headers, authorization: `Bearer ${data.session.access_token}` }
      }

      const url = audience === 'member'
        ? mode === 'create' ? '/api/wiki/entities' : `/api/wiki/entities/${values.id}`
        : mode === 'create' ? '/api/admin/entities' : `/api/admin/entities/${values.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const out = (await res.json().catch(() => null)) as { error?: string } | null
        if (memberCreate && res.status === 409) {
          if (addressRef.current) addressRef.current.open = true
          setError('Já existe uma página com esse endereço. Escolha outro no campo “Endereço da página”.')
        } else {
          setError(res.status === 401 ? 'Sua sessão expirou. Entre novamente e tente salvar.' : res.status >= 500 ? 'Não foi possível salvar. Seu texto foi mantido; tente novamente.' : out?.error ?? 'Não foi possível salvar. Revise os campos e tente novamente.')
        }
        setIsSaving(false)
        return
      }

      markSaved()
      if (memberCreate) {
        setCreated(true)
        return
      }
      if (audience === 'member') {
        router.push(`/${entityTypeToCollection[values.type]}/${values.slug.trim()}`)
      } else {
        const success = mode === 'create' ? 'created' : 'updated'
        router.push(`/admin/${collection}?success=${success}`)
      }
      router.refresh()
    } catch {
      setError('Não foi possível salvar. Sua edição foi mantida; tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (audience === 'member' && !authLoading && !user) {
    return (
      <div className="rounded border border-amber-300 bg-amber-50 px-5 py-4 text-amber-950">
        <p>Entre para criar e editar páginas.</p>
        <Link href={`/login?next=/wiki/${collection}/${mode === 'edit' ? `${initial.slug}/edit` : 'new'}`} className="mt-3 inline-block font-semibold text-amber-800 underline">Entrar / Criar conta</Link>
      </div>
    )
  }

  if (audience === 'member' && !enabled) {
    return <p className="rounded border border-amber-300 bg-amber-50 px-5 py-4 text-amber-950">A edição está temporariamente indisponível.</p>
  }

  if (created) {
    const destination = `/${entityTypeToCollection[values.type]}/${values.slug.trim()}`
    return <section className="space-y-5">
      <h2 ref={successRef} tabIndex={-1} className="text-2xl font-semibold outline-none">Página criada</h2>
      <p className="break-words"><strong>{values.name}</strong> já faz parte da wiki. {values.isSpoiler ? 'Somente mestres podem acessar.' : 'A página está visível para todos.'}</p>
      <p className="text-slate-700">Você pode continuar editando e acrescentar detalhes quando quiser.</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={destination} className="inline-flex min-h-11 items-center justify-center rounded bg-[#0a1628] px-4 py-2 font-semibold text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2">Ver página</Link>
        <Link href={`/wiki${destination}/edit`} className="inline-flex min-h-11 items-center justify-center rounded border border-slate-500 px-4 py-2 font-semibold focus-visible:outline-2">Continuar editando</Link>
        {/* A new document resets the form and its unsaved-changes guard. */}
        <a href={`/wiki/${entityTypeToCollection[values.type]}/new`} className="inline-flex min-h-11 items-center justify-center px-2 underline underline-offset-4 focus-visible:outline-2">Adicionar outra página</a>
      </div>
    </section>
  }

  return (
    <form onSubmit={onSubmit} onInvalidCapture={event => {
      const field = event.target as HTMLInputElement
      for (let parent = field.parentElement; parent; parent = parent.parentElement) {
        if (parent instanceof HTMLDetailsElement) parent.open = true
      }
    }} className="space-y-5">
      <fieldset disabled={isSaving || isUploading || (audience === 'member' && authLoading)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Categoria</span>
          {mode === 'create' && audience === 'member' ? <select value={values.type} onChange={(e) => changeType(e.target.value as EntityType)} className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="character">Personagem</option><option value="place">Lugar</option><option value="faction">Facção</option><option value="item">Item</option><option value="lore">Conhecimento</option><option value="monster">Criatura</option><option value="other">Outros</option>
          </select> : <input value={values.type} readOnly className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700" />}
        </label>

        {audience === 'admin' ? <label className="block">
          <span className="text-sm font-semibold text-slate-700">Status</span>
          <select
            value={values.status}
            onChange={(e) => update('status', e.target.value as EntityStatus)}
            className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="draft">Rascunho</option>
            <option value="review">Em revisão</option>
            <option value="published">Publicado</option>
          </select>
        </label> : null}
      </div>

      <div className={memberCreate ? "space-y-3" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Nome <span className="font-normal">(obrigatório)</span></span>
          <input
            maxLength={200}
            pattern={'.*\\S.*'}
            title="Digite um nome, além de espaços."
            value={values.name}
            onChange={(e) => {
              const name = e.target.value
              update('name', name)
              if (canAutoSlug) update('slug', slugify(name))
            }}
            className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </label>

        <details ref={addressRef} open={memberCreate ? undefined : true} className="min-w-0 text-sm">
          <summary className="min-h-11 cursor-pointer py-3 text-slate-700 underline decoration-slate-400 underline-offset-4 focus-visible:outline-2">Endereço da página <span className="font-normal">{memberCreate ? slugEdited ? '· personalizado' : '· gerado pelo nome' : ''}</span></summary>
          <p className="mb-2 break-all text-slate-600">/{entityTypeToCollection[values.type]}/{values.slug || "nome-da-pagina"}</p>
          <label className="block">
          <span className="font-semibold text-slate-700">Endereço da página</span>
          <input
            value={values.slug}
            onChange={(e) => { setSlugEdited(true); update('slug', e.target.value) }}
            maxLength={160}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            title="Use letras minúsculas sem acentos, números e hífens entre palavras."
            aria-describedby="entity-address-help"
            style={{ fontSize: '1rem' }}
            readOnly={audience === 'member' && mode === 'edit'}
            className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </label>
        <p id="entity-address-help" className="mt-2 text-slate-600">Use letras minúsculas sem acentos, números e hífens entre palavras.</p>
        </details>
      </div>

      <div className="block">
        <div className="flex items-center justify-between">
          <label htmlFor="entity-description" className="text-sm font-semibold text-slate-700">{values.type === 'place' ? 'Apresentação do lugar' : 'Descrição'} <span className="font-normal">(opcional)</span></label>
          {audience === 'admin' ? <button
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
          </button> : null}
        </div>
        <p id="entity-description-help" className="mt-1 text-sm text-slate-600">Quem ou o que é? Conte o que o grupo já sabe.</p>
        <WikiTextEditor
          aria-describedby="entity-description-help"
          maxLength={100000}
          id="entity-description"
          value={values.description}
          onChange={(value) => update('description', value)}
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
      </div>

      {/* Typed data fields */}
      {isDM && <label className="flex cursor-pointer items-center gap-3 border-t border-stone-400/50 pt-4 text-slate-800">
        <input type="checkbox" checked={values.isSpoiler === true} onChange={event => update('isSpoiler', event.target.checked)} className="h-5 w-5" />
        <span><span className="block font-semibold">Restringir a mestres (spoiler)</span><span className="text-sm text-slate-600" role="status">{values.isSpoiler ? "Somente mestres podem acessar esta página." : "Visível para todos, incluindo visitantes sem conta."}</span></span>
      </label>}
      {values.type !== 'other' && <details ref={detailsRef} open={memberCreate ? undefined : true} className="border-t border-stone-400/50 pt-2">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold text-slate-800 focus-visible:outline-2">Adicionar detalhes <span className="font-normal text-slate-600">(opcional)</span></summary>
        <p className="mb-5 text-sm text-slate-600">Preencha somente o que você sabe. Os detalhes podem ficar para depois.</p>
      {values.type === 'character' ? (
        <div className="space-y-5 py-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Detalhes do personagem</h2>

          <div className="grid grid-cols-1 gap-4">

            <div className="border-t border-stone-400/50 pt-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Identidade</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Raça</span>
                  <input
                    value={(dataFields as CharacterFields).race}
                    onChange={(e) => updateDataField('race', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Classe</span>
                  <input
                    value={(dataFields as CharacterFields).class}
                    onChange={(e) => updateDataField('class', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Alinhamento</span>
                  <input
                    value={(dataFields as CharacterFields).alignment}
                    onChange={(e) => updateDataField('alignment', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Status</span>
                  <select
                    value={(dataFields as CharacterFields).status}
                    onChange={(e) => updateDataField('status', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {!['active', 'deceased', 'unknown', 'missing'].includes((dataFields as CharacterFields).status) && <option value={(dataFields as CharacterFields).status}>{(dataFields as CharacterFields).status}</option>}
                    <option value="active">Ativo</option>
                    <option value="deceased">Morto</option>
                    <option value="unknown">Desconhecido</option>
                    <option value="missing">Desaparecido</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="border-t border-stone-400/50 pt-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Lore</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Títulos (separados por vírgulas)</span>
                  <input
                    value={(dataFields as CharacterFields).titles}
                    onChange={(e) => updateDataField('titles', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Afiliação</span>
                  <input
                    value={(dataFields as CharacterFields).affiliation}
                    onChange={(e) => updateDataField('affiliation', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Hierarquia (separada por vírgulas)</span>
                  <input
                    value={(dataFields as CharacterFields).hierarchy}
                    onChange={(e) => updateDataField('hierarchy', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-stone-400/50 pt-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Características</h3>
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Habilidades (separadas por vírgulas)</span>
                  <input
                    value={(dataFields as CharacterFields).abilities}
                    onChange={(e) => updateDataField('abilities', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Fraquezas (separadas por vírgulas)</span>
                  <input
                    value={(dataFields as CharacterFields).weaknesses}
                    onChange={(e) => updateDataField('weaknesses', e.target.value)}
                    className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-stone-400/50 pt-5">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Combate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Classe de armadura (CA)</span>
                <input
                  inputMode="numeric"
                  value={(dataFields as CharacterFields).combatAc}
                  onChange={(e) => updateDataField('combatAc', e.target.value)}
                  className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Pontos de vida (PV)</span>
                <input
                  value={(dataFields as CharacterFields).combatHp}
                  onChange={(e) => updateDataField('combatHp', e.target.value)}
                  className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Deslocamento</span>
                <input
                  value={(dataFields as CharacterFields).combatSpeed}
                  onChange={(e) => updateDataField('combatSpeed', e.target.value)}
                  className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Ataques (separados por vírgulas)</span>
                <input
                  value={(dataFields as CharacterFields).combatAttacks}
                  onChange={(e) => updateDataField('combatAttacks', e.target.value)}
                  className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>
          <div className="mt-8 space-y-6">
            <CharacterMediaEditor media={(dataFields as CharacterFields).media} onChange={media => updateDataField('media', media)} onBusyChange={setIsUploading} />
            <CharacterCardEditor value={(dataFields as CharacterFields).card3d} onChange={card => updateDataField('card3d', card)} name={values.name} onBusyChange={setIsUploading} />
          </div>
        </div>
      ) : null}

      {values.type === 'place' ? (
        <PlaceEditor audience={audience} value={{ ...(dataFields as PlaceFields), notableLocations: (dataFields as PlaceFields).notableLocations.split('\n') }} onBusyChange={setIsUploading} onChange={place => {
          const next = { ...dataFields, ...place, notableLocations: (place.notableLocations ?? []).join('\n') } as PlaceFields
          setDataFields(next); fieldsByType.current.set('place', next)
        }} />
      ) : null}

      {values.type === 'faction' ? (
        <div className="space-y-5 py-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Detalhes da facção</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Alinhamento</span>
              <input
                value={(dataFields as FactionFields).alignment}
                onChange={(e) => updateDataField('alignment', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Sede</span>
              <input
                value={(dataFields as FactionFields).headquarters}
                onChange={(e) => updateDataField('headquarters', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Líder</span>
              <input
                value={(dataFields as FactionFields).leader}
                onChange={(e) => updateDataField('leader', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Domínios (separados por vírgulas)</span>
              <input
                value={(dataFields as FactionFields).domains}
                onChange={(e) => updateDataField('domains', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Áreas de influência (separadas por vírgulas)</span>
              <input
                value={(dataFields as FactionFields).portfolio}
                onChange={(e) => updateDataField('portfolio', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Objetivos (separados por vírgulas)</span>
              <input
                value={(dataFields as FactionFields).goals}
                onChange={(e) => updateDataField('goals', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      {values.type === 'item' ? (
        <div className="space-y-5 py-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Detalhes do item</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Raridade</span>
              <input
                value={(dataFields as ItemFields).rarity}
                onChange={(e) => updateDataField('rarity', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Tipo</span>
              <input
                value={(dataFields as ItemFields).type}
                onChange={(e) => updateDataField('type', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={(dataFields as ItemFields).attunement}
                onChange={(e) => updateDataField('attunement', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-semibold text-slate-700">Requer sintonização</span>
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Propriedades (separadas por vírgulas)</span>
              <input
                value={(dataFields as ItemFields).properties}
                onChange={(e) => updateDataField('properties', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Efeitos (separados por vírgulas)</span>
              <input
                value={(dataFields as ItemFields).effects}
                onChange={(e) => updateDataField('effects', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      {values.type === 'lore' ? (
        <div className="space-y-5 py-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Detalhes do conhecimento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Categoria</span>
              <input
                value={(dataFields as LoreFields).category}
                onChange={(e) => updateDataField('category', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Época</span>
              <input
                value={(dataFields as LoreFields).era}
                onChange={(e) => updateDataField('era', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Dogmas (separados por vírgulas)</span>
              <input
                value={(dataFields as LoreFields).dogma}
                onChange={(e) => updateDataField('dogma', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Provérbios (separados por vírgulas)</span>
              <input
                value={(dataFields as LoreFields).proverbs}
                onChange={(e) => updateDataField('proverbs', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Importância</span>
              <input
                value={(dataFields as LoreFields).significance}
                onChange={(e) => updateDataField('significance', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      {values.type === 'monster' ? (
        <div className="space-y-5 py-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Detalhes da criatura</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ['cr', 'Nível de desafio (ND)'],
                ['size', 'Tamanho'],
                ['type', 'Tipo'],
                ['alignment', 'Alinhamento'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  value={String((dataFields as unknown as Record<string, unknown>)[key] ?? '')}
                  onChange={(e) => updateDataField(key, e.target.value)}
                  className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </label>
            ))}

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Ambientes (separados por vírgulas)</span>
              <input
                value={(dataFields as MonsterFields).environment}
                onChange={(e) => updateDataField('environment', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Habilidades (separadas por vírgulas)</span>
              <input
                value={(dataFields as MonsterFields).abilities}
                onChange={(e) => updateDataField('abilities', e.target.value)}
                className="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>
      ) : null}

      </details>}

      <div className="space-y-3 border-t border-stone-400/50 pt-5">
      {memberCreate && <p className="text-sm text-slate-700">{values.isSpoiler ? 'Ao criar, a página fica disponível somente para mestres.' : 'Ao criar, a página fica pública na wiki.'} Você pode editar depois.</p>}
      {error && <div ref={errorRef} role="alert" tabIndex={-1} className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 focus-visible:outline-2 focus-visible:outline-red-800">{error}</div>}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <button
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[#0a1628] px-4 py-2 text-sm font-semibold text-amber-300 hover:text-amber-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 disabled:opacity-60"
        >
          <Icon icon="game-icons:save" className="w-5 h-5" />
          {isSaving ? 'Salvando…' : isUploading ? 'Aguarde o envio da foto…' : mode === 'create' ? 'Criar página' : 'Salvar alterações'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (allowLeave()) {
              if (audience === 'member' && mode === 'create') router.push('/browse')
              else router.back()
            }
          }}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Icon icon="game-icons:cancel" className="w-5 h-5" />
          Cancelar
        </button>
      </div>
      </div>
      </fieldset>
    </form>
  )
}
