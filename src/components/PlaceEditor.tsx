'use client'

import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import type { PlaceData } from '@/types/entities'
import { mapLocations } from '@/lib/mapLocations'
import { supabase } from '@/lib/supabase'
import { CharacterMediaEditor } from './CharacterMediaEditor'
import { ImageUpload } from './ImageUpload'

const field = 'mt-1 min-h-11 w-full rounded border border-stone-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-800'
const action = 'inline-flex min-h-11 items-center justify-center gap-2 rounded border border-amber-800 px-3 text-sm text-amber-900 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 disabled:opacity-40'

export function PlaceEditor({ value, onChange, onBusyChange, audience = 'member' }: { value: PlaceData; onChange: (value: PlaceData) => void; onBusyChange: (busy: boolean) => void; audience?: 'member' | 'admin' }) {
  const [characters, setCharacters] = useState<{ name: string; slug: string }[]>([])
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session && audience === 'member') throw new Error('Entre para procurar páginas de personagens.')
        const response = await fetch(audience === 'admin' ? '/api/admin/references' : '/api/wiki/references', { headers: session && audience === 'member' ? { authorization: `Bearer ${session.access_token}` } : {} })
        if (!response.ok) throw new Error('Não foi possível carregar os personagens. Seus vínculos atuais foram mantidos.')
        const data = await response.json()
        if (active) { setCharacters(data); setError('') }
      } catch (error) { if (active) setError(error instanceof Error ? error.message : 'Não foi possível carregar os personagens.') }
    }
    void load()
    return () => { active = false }
  }, [attempt, audience])
  const sections = value.sections ?? []
  const residents = value.residents ?? []
  function move(index: number, step: number) {
    const next = [...sections]
    ;[next[index], next[index + step]] = [next[index + step], next[index]]
    onChange({ ...value, sections: next })
  }
  return <div className="space-y-8 text-slate-800 [&_h2]:font-cinzel [&_h2]:text-xl">
    <section className="border-t border-stone-300 pt-6">
      <h2>Ficha do lugar</h2><p className="mt-2 text-sm text-stone-600">Preencha somente o que é conhecido. Campos vazios não aparecem na página.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {([['type', 'Tipo de lugar'], ['region', 'Região'], ['population', 'População'], ['government', 'Governo'], ['climate', 'Clima']] as const).map(([key, label]) => <label key={key} className="text-sm">{label}<input maxLength={5000} value={value[key] ?? ''} onChange={event => onChange({ ...value, [key]: event.target.value })} className={field} /></label>)}
      </div>
      {(value.function || value.design) && <div className="mt-4 grid gap-4 sm:grid-cols-2">{([['function', 'Função'], ['design', 'Arquitetura']] as const).map(([key, label]) => <label key={key} className="text-sm">{label}<textarea maxLength={5000} rows={3} value={value[key] ?? ''} className={field} onChange={event => onChange({ ...value, [key]: event.target.value })} /></label>)}</div>}
    </section>
    <section className="border-t border-stone-300 pt-6">
      <h2>Seções de conteúdo</h2><p className="mt-2 text-sm text-stone-600">História, Governo, Comércio, Defesas… Escolha os títulos e a ordem de cada lugar.</p>
      {sections.map((section, index) => <fieldset key={index} className="mt-5 border-b border-stone-200 pb-5">
        <legend className="sr-only">Seção {index + 1}</legend>
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" className={action} disabled={!index} onClick={() => move(index, -1)} aria-label={`Mover seção ${index + 1} para cima`}><Icon icon="mdi:arrow-up" /></button>
          <button type="button" className={action} disabled={index === sections.length - 1} onClick={() => move(index, 1)} aria-label={`Mover seção ${index + 1} para baixo`}><Icon icon="mdi:arrow-down" /></button>
          <button type="button" className={action} onClick={() => onChange({ ...value, sections: sections.filter((_, i) => i !== index) })}>Remover seção {index + 1}</button>
        </div>
        <label className="block text-sm">Título da seção<input required maxLength={120} value={section.title} className={field} onChange={event => onChange({ ...value, sections: sections.map((item, i) => i === index ? { ...item, title: event.target.value } : item) })} /></label>
        <label className="mt-3 block text-sm">Texto da seção<textarea required maxLength={50000} rows={6} value={section.content} className={field} onChange={event => onChange({ ...value, sections: sections.map((item, i) => i === index ? { ...item, content: event.target.value } : item) })} /></label>
      </fieldset>)}
      <button type="button" className={`${action} mt-4`} disabled={sections.length >= 30} onClick={() => onChange({ ...value, sections: [...sections, { title: '', content: '' }] })}><Icon icon="mdi:plus" />Adicionar seção</button>
    </section>
    <section className="border-t border-stone-300 pt-6"><h2 className="mb-4">Fotos e ilustrações</h2><CharacterMediaEditor title="Galeria do lugar" media={value.media ?? []} onChange={media => onChange({ ...value, media })} onBusyChange={onBusyChange} /></section>
    <section className="border-t border-stone-300 pt-6">
      <h2>Pessoas do lugar</h2><p className="mt-2 text-sm text-stone-600">Cadastre uma pessoa mesmo que ela ainda não tenha página. O vínculo pode ser adicionado depois.</p>
      {error && <div role="status" className="mt-3 text-sm text-amber-900">{error} <button type="button" className="min-h-11 underline" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></div>}
      {residents.map((resident, index) => <fieldset key={index} className="mt-5 space-y-3 border-b border-stone-200 pb-5">
        <legend className="mb-3 font-semibold">Pessoa {index + 1}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {([['name', 'Nome'], ['role', 'Função']] as const).map(([key, label]) => <label key={key} className="text-sm">{label}<input required={key === 'name'} maxLength={key === 'name' ? 200 : 5000} value={resident[key] ?? ''} className={field} onChange={event => onChange({ ...value, residents: residents.map((item, i) => i === index ? { ...item, [key]: event.target.value } : item) })} /></label>)}
        </div>
        <label className="block text-sm">Descrição<textarea rows={3} maxLength={5000} value={resident.description ?? ''} className={field} onChange={event => onChange({ ...value, residents: residents.map((item, i) => i === index ? { ...item, description: event.target.value } : item) })} /></label>
        <label className="block text-sm">Página de personagem (opcional)<select value={resident.characterSlug ?? ''} className={field} onChange={event => onChange({ ...value, residents: residents.map((item, i) => i === index ? { ...item, characterSlug: event.target.value } : item) })}>
          <option value="">Sem página vinculada</option>
          {resident.characterSlug && !characters.some(character => character.slug === resident.characterSlug) && <option value={resident.characterSlug}>Vínculo atual: {resident.characterSlug}</option>}
          {characters.map(character => <option key={character.slug} value={character.slug}>{character.name}</option>)}
        </select></label>
        <label className="block text-sm">Endereço do retrato (opcional)<input maxLength={2048} value={resident.image ?? ''} className={field} onChange={event => onChange({ ...value, residents: residents.map((item, i) => i === index ? { ...item, image: event.target.value } : item) })} /></label>
        <ImageUpload onBusyChange={onBusyChange} onUpload={image => onChange({ ...value, residents: residents.map((item, i) => i === index ? { ...item, image } : item) })} />
        <button type="button" className={action} onClick={() => onChange({ ...value, residents: residents.filter((_, i) => i !== index) })}>Remover pessoa {index + 1}</button>
      </fieldset>)}
      <button type="button" className={`${action} mt-4`} disabled={residents.length >= 100} onClick={() => onChange({ ...value, residents: [...residents, { name: '' }] })}><Icon icon="mdi:plus" />Adicionar pessoa</button>
    </section>
    <section className="border-t border-stone-300 pt-6">
      <h2>Mapas e localização</h2>
      <label className="mt-4 block text-sm">Ponto no mapa de Átrias (opcional)<select value={value.mapMarker ?? ''} className={field} onChange={event => onChange({ ...value, mapMarker: event.target.value || null })}><option value="">Sem vínculo com o mapa</option>{mapLocations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label>
      <p className="mt-2 mb-6 text-sm text-stone-600">O vínculo permite navegar entre esta página e o ponto do mapa. Plantas e mapas locais entram na galeria abaixo.</p>
      <CharacterMediaEditor title="Mapas do lugar" imagesOnly media={value.maps ?? []} onChange={maps => onChange({ ...value, maps })} onBusyChange={onBusyChange} />
      <label className="mt-5 block text-sm">Locais de interesse (um por linha)<textarea rows={4} value={(value.notableLocations ?? []).join('\n')} onChange={event => onChange({ ...value, notableLocations: event.target.value.split('\n') })} className={field} /></label>
    </section>
  </div>
}

