import { WikiText } from '@/components/WikiText'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUp, BookOpen, ChevronRight, Feather } from 'lucide-react'
import ImageGallery from '@/components/ImageGallery'
import { getEntityBySlug, getPlacesForCharacter } from '@/db/queries/entities'
import type { CharacterData } from '@/types/entities'
import { getCharacterMedia } from '@/lib/characterMedia'
import { getCharacterCard } from '@/lib/characterCard'
import { CharacterCardViewer } from '@/components/CharacterCard'
import { WikiContributionActions } from '@/components/WikiContributionActions'
import { WikiLastEdited } from '@/components/WikiLastEdited'
import { WikiFavoriteButton } from '@/components/WikiFavoriteButton'
import styles from './character.module.css'

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  active: 'Ativo', deceased: 'Falecido', unknown: 'Desconhecido', missing: 'Desaparecido',
}

export default async function CharacterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entity = await getEntityBySlug('character', slug)
  if (!entity) notFound()
  const places = await getPlacesForCharacter(slug)
  const data = (entity.data ?? {}) as CharacterData
  const media = getCharacterMedia(data, entity.image)
  const card = getCharacterCard(data.card3d)
  const facts = [
    { label: 'Raça', value: data.race },
    { label: 'Status', value: data.status ? statusLabels[data.status] || data.status : undefined },
    { label: 'Alinhamento', value: data.alignment },
    { label: 'Afiliação', value: data.affiliation },
  ].filter(fact => fact.value)
  const abilities = data.abilities ?? []
  const weaknesses = data.weaknesses ?? []
  const hierarchy = data.hierarchy ?? []
  const combat = data.combat
  const hasCombat = Boolean(combat && (combat.ac != null || combat.hp || combat.speed || combat.attacks?.length))
  const hasReference = abilities.length > 0 || weaknesses.length > 0 || hierarchy.length > 0 || hasCombat
  const sections = [
    ...(entity.description ? [{ id: 'historia', label: 'História' }] : []),
    ...(abilities.length ? [{ id: 'habilidades', label: 'Habilidades' }] : []),
    ...(weaknesses.length ? [{ id: 'fraquezas', label: 'Fraquezas' }] : []),
    ...(hierarchy.length ? [{ id: 'hierarquia', label: 'Hierarquia' }] : []),
    ...(hasCombat ? [{ id: 'combate', label: 'Combate' }] : []),
  ]

  return <main id="inicio" className={styles.page}>


    <div className={styles.container}>
      <nav aria-label="Caminho da página" className={styles.breadcrumb}>
        <Link href="/">Início</Link><ChevronRight aria-hidden="true" size={14} />
        <Link href="/characters">Personagens</Link><ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page">{entity.name}</span>
      </nav>

      <section aria-labelledby="character-name" className={`${styles.hero} ${!media.length ? styles.withoutMedia : ''}`}>
        <div className={styles.identity}>
          <h1 id="character-name">{entity.name}</h1>
          {data.class && <p className={styles.characterClass}>{data.class}</p>}
          {!!data.titles?.length && <p className={styles.title}>{data.titles.join(' · ')}</p>}
          {!!places.length && <p className="mt-4 flex flex-wrap gap-3 text-sm text-amber-900">{places.map(place => <Link key={place.slug} href={`/places/${place.slug}`} className="inline-flex min-h-11 items-center underline underline-offset-4">{place.name}</Link>)}</p>}
          <div className={styles.actions}>
            <WikiFavoriteButton entityId={entity.id} />
            <WikiContributionActions collection="characters" slug={slug} entityId={entity.id} subtle enabled={process.env.WIKI_EDITING_ENABLED !== 'false'} />
          </div>
          {!media.length && card && <CharacterCardViewer card={card} name={entity.name} />}
        </div>
        {!!media.length && <div className={styles.media}>
          <ImageGallery key={entity.id} media={media} name={entity.name} />
          {card && <CharacterCardViewer card={card} name={entity.name} />}
        </div>}
        {!!facts.length && <dl aria-label="Ficha do personagem" className={styles.facts}>
          {facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
        </dl>}
      </section>

      {sections.length > 1 && <nav className={styles.sectionNav} aria-label="Nesta página">
        <span>Nesta página</span>
        <div>{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</div>
      </nav>}

      <div className={`${styles.content} ${!hasReference ? styles.withoutReference : ''}`}>
        <article id="historia" className={styles.story}>
          <h2><Feather aria-hidden="true" size={22} />História</h2>
          {entity.description ? <div className={styles.prose}>
            {entity.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}><WikiText text={paragraph} /></p>)}
          </div> : <p className={styles.empty}>A história deste personagem ainda não foi registrada.</p>}
        </article>

        {hasReference && <aside aria-label="Referência do personagem" className={styles.reference}>
          {!!abilities.length && <section id="habilidades"><h2>Habilidades</h2><ul>{abilities.map((ability, index) => <li key={index}>{ability}</li>)}</ul></section>}
          {!!weaknesses.length && <section id="fraquezas"><h2>Fraquezas</h2><ul>{weaknesses.map((weakness, index) => <li key={index}>{weakness}</li>)}</ul></section>}
          {!!hierarchy.length && <section id="hierarquia"><h2>Hierarquia</h2><ol>{hierarchy.map((level, index) => <li key={index}>{level}</li>)}</ol></section>}
          {hasCombat && combat && <section id="combate">
            <h2>Combate</h2>
            <dl className={styles.combat}>
              {combat.ac != null && <div><dt>Classe de armadura</dt><dd>{combat.ac}</dd></div>}
              {combat.hp && <div><dt>Pontos de vida</dt><dd>{combat.hp}</dd></div>}
              {combat.speed && <div><dt>Deslocamento</dt><dd>{combat.speed}</dd></div>}
            </dl>
            {!!combat.attacks?.length && <><h3>Ataques</h3><ul>{combat.attacks.map((attack, index) => <li key={index}>{attack}</li>)}</ul></>}
          </section>}
        </aside>}
      </div>

      <div className={styles.endmatter}>
        <WikiLastEdited entity={entity} />
        <div className={styles.endLinks}>
          <Link href="/characters"><ArrowLeft aria-hidden="true" size={16} />Todos os personagens</Link>
          <a href="#inicio">Voltar ao início<ArrowUp aria-hidden="true" size={16} /></a>
        </div>
      </div>
    </div>

    <footer className={styles.footer}><BookOpen aria-hidden="true" size={20} /><span className="font-cinzel">Wiki Átrias</span><span>As crônicas de Átrias são escritas pelo sangue dos heróis e as lágrimas dos caídos.</span></footer>
  </main>
}
