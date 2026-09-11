import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@iconify/react'
import { getEntitiesByType, getEntityBySlug } from '@/db/queries/entities'
import type { PlaceData } from '@/types/entities'
import { getPlaceContent, getPlaceMaps } from '@/lib/placeContent'
import { getCharacterMedia, isMediaUrl } from '@/lib/characterMedia'
import { getPlaceMarker } from '@/lib/mapLocations'
import ImageGallery from '@/components/ImageGallery'
import { WikiContributionActions } from '@/components/WikiContributionActions'
import { WikiFavoriteButton } from '@/components/WikiFavoriteButton'
import { WikiLastEdited } from '@/components/WikiLastEdited'
import styles from './place.module.css'

export const dynamic = 'force-dynamic'

function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\r?\n/).filter(line => line.trim()).map((line, index) => <p key={index}>{line}</p>)}</>
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entity = await getEntityBySlug('place', slug)
  if (!entity) notFound()
  const data = (entity.data ?? {}) as PlaceData
  const content = getPlaceContent(data, entity.description ?? '')
  const media = getCharacterMedia(data, entity.image)
  const maps = getPlaceMaps(data)
  const marker = getPlaceMarker(data, slug)
  const residents = data.residents ?? []
  const characters = residents.some(resident => resident.characterSlug) ? await getEntitiesByType('character') : []
  const sections = [
    ...content.sections,
    ...(data.function ? [{ title: 'Função', content: data.function }] : []),
    ...(data.design ? [{ title: 'Arquitetura', content: data.design }] : []),
  ].filter(section => section.title && section.content)
  const facts = [
    { label: 'População', value: data.population },
    { label: 'Governo', value: data.government },
    { label: 'Clima', value: data.climate },
  ].filter(fact => fact.value)
  const landmarks = (data.notableLocations ?? []).filter(Boolean)
  const navigation = [
    ...(content.intro ? [{ id: 'visao-geral', title: 'Visão geral' }] : []),
    ...sections.map((section, index) => ({ id: `secao-${index + 1}`, title: section.title })),
    ...(residents.length ? [{ id: 'pessoas', title: 'Pessoas' }] : []),
    ...(landmarks.length ? [{ id: 'locais', title: 'Locais de interesse' }] : []),
    ...(maps.length ? [{ id: 'mapas', title: 'Mapas' }] : []),
  ]
  return <main id="inicio" className={styles.page}>
    <div className={styles.container}>
      <nav aria-label="Caminho da página" className={styles.breadcrumb}><Link href="/">Início</Link><span aria-hidden="true">/</span><Link href="/places">Lugares</Link><span aria-hidden="true">/</span><span aria-current="page">{entity.name}</span></nav>
      <header className={styles.identity}>
        <div><h1>{entity.name}</h1>{(data.type || data.region) && <p className={styles.location}>{[data.type, data.region].filter(Boolean).join(' · ')}</p>}</div>
        <div className={styles.actions}>
          {marker && <Link href={`/map?place=${encodeURIComponent(slug)}`} className={styles.mapLink}><Icon icon="mdi:map-marker-outline" aria-hidden="true" />Ver no mapa de Átrias</Link>}
          <WikiFavoriteButton entityId={entity.id} /><WikiContributionActions collection="places" slug={slug} entityId={entity.id} subtle enabled={process.env.WIKI_EDITING_ENABLED !== 'false'} />
        </div>
      </header>
      {!!media.length && <div className={styles.cover}><ImageGallery media={media} name={entity.name} /></div>}
      {!!facts.length && <dl className={styles.facts} aria-label="Ficha do lugar">{facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
      {navigation.length > 1 && <nav aria-label="Nesta página" className={styles.sectionNav}><span>Nesta página</span><div>{navigation.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</div></nav>}
      <div className={styles.reading}>
        {content.intro ? <section id="visao-geral" className={styles.section}><h2>Visão geral</h2><div className={styles.prose}><Paragraphs text={content.intro} /></div></section> : !sections.length && <p className={styles.empty}>A descrição deste lugar ainda não foi registrada.</p>}
        {sections.map((section, index) => <section key={index} id={`secao-${index + 1}`} className={styles.section}><h2>{section.title}</h2><div className={styles.prose}><Paragraphs text={section.content} /></div></section>)}
      </div>
      {!!residents.length && <section id="pessoas" className={styles.people}>
        <h2>Pessoas de {entity.name}</h2>
        <div className={styles.peopleGrid}>{residents.map((resident, index) => {
          const character = characters.find(character => character.slug === resident.characterSlug)
          const portrait = resident.image || (character ? getCharacterMedia(character.data ?? {}, character.image).find(item => item.type === 'image')?.src : undefined)
          return <article key={index} className={styles.person}>
            {isMediaUrl(portrait) && <img src={portrait} alt={`Retrato de ${resident.name}`} width={112} height={128} loading="lazy" />}
            <div><h3>{character ? <Link href={`/characters/${character.slug}`}>{resident.name}<Icon icon="mdi:arrow-top-right" aria-hidden="true" /></Link> : resident.name}</h3>
              {resident.role && <p className={styles.role}>{resident.role}</p>}
              {resident.description && <div className={styles.personDescription}><Paragraphs text={resident.description} /></div>}
              {!resident.characterSlug && <Link className={styles.createLink} href={`/wiki/characters/new?name=${encodeURIComponent(resident.name)}`}>Criar página de personagem</Link>}
            </div>
          </article>
        })}</div>
      </section>}
      {!!landmarks.length && <section id="locais" className={styles.section}><h2>Locais de interesse</h2><ul className={styles.landmarks}>{landmarks.map((place, index) => <li key={index}>{place}</li>)}</ul></section>}
      {!!maps.length && <section id="mapas" className={styles.maps}><div className={styles.mapHeading}><h2>Mapas do lugar</h2>{marker && <Link href={`/map?place=${encodeURIComponent(slug)}`}>Localizar em Átrias<Icon icon="mdi:arrow-top-right" aria-hidden="true" /></Link>}</div><ImageGallery media={maps} name={`Mapas de ${entity.name}`} /></section>}
      <div className={styles.endmatter}><WikiLastEdited entity={entity} /><div><Link href="/places"><Icon icon="mdi:arrow-left" aria-hidden="true" />Todos os lugares</Link><a href="#inicio">Voltar ao início<Icon icon="mdi:arrow-up" aria-hidden="true" /></a></div></div>
    </div>
    <footer className={styles.footer}><span className="font-cinzel">Wiki Átrias</span><p>As crônicas de Átrias são escritas pelo sangue dos heróis e as lágrimas dos caídos.</p></footer>
  </main>
}
