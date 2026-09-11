import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import CinematicComet from '@/components/CinematicComet'
import { getEntityCounts, getEntitiesByType } from '@/db/queries/entities'
import { getCharacterMedia } from '@/lib/characterMedia'
import { getPlaceContent, getPlaceMaps } from '@/lib/placeContent'
import { wikiLinkText } from '@/lib/wikiLinks'
import type { PlaceData } from '@/types/entities'
import styles from './home.module.css'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [stats, places, characters, factions] = await Promise.all([
    getEntityCounts(), getEntitiesByType('place'), getEntitiesByType('character'), getEntitiesByType('faction'),
  ])
  const navigation = [
    { title: 'O mundo', links: [
      { label: 'Personagens', href: '/characters', count: stats.characters },
      { label: 'Lugares', href: '/places', count: stats.places },
      { label: 'Facções', href: '/factions', count: stats.factions },
      { label: 'Itens', href: '/items', count: stats.items },
    ] },
    { title: 'O acervo', links: [
      { label: 'Conhecimento', href: '/lore', count: stats.lore },
      { label: 'Criaturas', href: '/monsters', count: stats.monsters },
      { label: 'Outros registros', href: '/others', count: stats.others },
    ] },
    { title: 'À mesa', links: [
      { label: 'Sessões', href: '/sessions' },
      { label: 'Linha do tempo', href: '/timeline' },
      { label: 'Mesa de dados', href: '/dice' },
    ] },
  ]

  return <main className={styles.page}>
    <CinematicComet />
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroContent}>
        <h1 id="home-title">Wiki Átrias</h1>
        <p className={styles.subtitle}>Desvende as crônicas de Átrias.</p>
        <div className={styles.actions}>
          <Link href="/browse" className={styles.primary}><Icon icon="game-icons:book-cover" aria-hidden="true" />Explorar os arquivos</Link>
          <Link href="/map" className={styles.secondary}><Icon icon="game-icons:treasure-map" aria-hidden="true" />Ver o mapa do mundo</Link>
          <Link href="/dice" className={styles.secondary}><Icon icon="game-icons:rolling-dices" aria-hidden="true" />Mesa de Dados</Link>
        </div>
      </div>
      <a href="#arquivos" className={styles.scrollHint} aria-label="Ver categorias dos arquivos"><Icon icon="mdi:arrow-down" aria-hidden="true" /></a>
    </section>

    <div id="arquivos" className={`${styles.container} ${styles.directory}`}>
      {navigation.map(group => <nav key={group.title} aria-label={group.title}>
        <h2>{group.title}</h2>
        <ul>{group.links.map(link => <li key={link.href}>
          <Link href={link.href}><span>{link.label}</span><span className={styles.count}>{'count' in link ? (link.count === 0 ? 'Sem registros' : link.count) : <Icon icon="mdi:arrow-right" aria-hidden="true" />}</span></Link>
        </li>)}</ul>
      </nav>)}
    </div>

    <section className={styles.places} aria-labelledby="places-title">
      <div className={styles.container}>
        <div className={styles.sectionHeading}><h2 id="places-title">Lugares em destaque</h2><Link href="/places">Todos os lugares <Icon icon="mdi:arrow-right" aria-hidden="true" /></Link></div>
        <div className={styles.placeList}>
          {places.slice(0, 3).map(place => {
            const data = (place.data ?? {}) as PlaceData
            const cover = getCharacterMedia(data, place.image).find(item => item.type === 'image') ?? getPlaceMaps(data)[0]
            return <Link key={place.id} href={`/places/${place.slug}`} aria-label={`Conhecer ${place.name}`} className={styles.place}>
              {cover && <Image src={cover.src} alt={cover.alt || `Ilustração de ${place.name}`} width={800} height={460} unoptimized className={styles.placeImage} />}
              <div className={styles.placeText}>
                <h3>{place.name}</h3>
                <p>{wikiLinkText(getPlaceContent(data, place.description ?? '').intro) || 'A descrição deste lugar ainda não foi registrada.'}</p>
                <span className={styles.readLink}>Conhecer {place.name} <Icon icon="mdi:arrow-right" aria-hidden="true" /></span>
              </div>
            </Link>
          })}
          {!places.length && <p className={styles.empty}>Os lugares deste mundo ainda estão sendo registrados. Explore as outras categorias nos arquivos.</p>}
        </div>
      </div>
    </section>

    <section className={`${styles.container} ${styles.section}`} aria-labelledby="characters-title">
      <div className={styles.sectionHeading}><h2 id="characters-title">Personagens em destaque</h2><Link href="/characters">Todos os personagens <Icon icon="mdi:arrow-right" aria-hidden="true" /></Link></div>
      <div className={styles.characters}>
        {characters.slice(0, 3).map(character => {
          const portrait = getCharacterMedia(character.data ?? {}, character.image).find(item => item.type === 'image')
          return <Link key={character.id} href={`/characters/${character.slug}`} aria-label={`Conhecer ${character.name}`} className={styles.character}>
            {portrait && <Image src={portrait.src} alt={portrait.alt || `Retrato de ${character.name}`} width={112} height={136} unoptimized className={styles.portrait} />}
            <div><h3>{character.name}</h3><p>{wikiLinkText(character.description ?? '') || 'A história deste personagem ainda não foi registrada.'}</p><span className={styles.readLink}>Conhecer {character.name} <Icon icon="mdi:arrow-right" aria-hidden="true" /></span></div>
          </Link>
        })}
        {!characters.length && <p className={styles.empty}>Ainda não há personagens registrados. Consulte as outras categorias nos arquivos.</p>}
      </div>
    </section>

    <section className={`${styles.container} ${styles.section} ${styles.factions}`} aria-labelledby="factions-title">
      <div className={styles.sectionHeading}><h2 id="factions-title">Ordens e facções</h2><Link href="/factions">Todas as facções <Icon icon="mdi:arrow-right" aria-hidden="true" /></Link></div>
      <div className={styles.factionList}>
        {factions.slice(0, 3).map(faction => <Link key={faction.id} href={`/factions/${faction.slug}`} aria-label={`Conhecer ${faction.name}`} className={styles.faction}>
          <Icon icon="game-icons:rally-the-troops" className={styles.factionIcon} aria-hidden="true" />
          <div><h3>{faction.name}</h3><p>{wikiLinkText(faction.description ?? '') || 'A história desta facção ainda não foi registrada.'}</p><span className={styles.readLink}>Conhecer {faction.name} <Icon icon="mdi:arrow-right" aria-hidden="true" /></span></div>
        </Link>)}
        {!factions.length && <p className={styles.empty}>Ainda não há facções registradas. Consulte as outras categorias nos arquivos.</p>}
      </div>
    </section>

    <section className={styles.about} aria-labelledby="about-title">
      <div className={`${styles.container} ${styles.aboutContent}`}>
        <div><h2 id="about-title">O arquivo continua com a mesa.</h2><p>A Wiki Átrias reúne o universo criado pelo Mestre e os registros das campanhas. São <strong className={styles.total}>{stats.total}</strong> entradas para consultar e explorar, mesmo sem uma conta.</p></div>
        <div className={styles.contribute}>
          {process.env.WIKI_EDITING_ENABLED !== 'false' ? <><p>Para contribuir, entre na sua conta e abra a página que deseja editar, ou adicione um novo registro.</p><Link href="/wiki/others/new" className={styles.secondary}>Adicionar registro <Icon icon="mdi:arrow-right" aria-hidden="true" /></Link></> : <><p>Encontre um nome, um lugar ou uma história para continuar sua leitura.</p><Link href="/search" className={styles.secondary}>Pesquisar na wiki <Icon icon="mdi:arrow-right" aria-hidden="true" /></Link></>}
        </div>
      </div>
    </section>

    <footer className={styles.footer}><div className={styles.container}>
      <p>© 2026 Wiki Átrias. Um cenário de campanha de D&amp;D.</p>
      <nav aria-label="Links do rodapé"><Link href="/browse">Arquivos</Link><Link href="/search">Pesquisar</Link><Link href="/login">Minha conta</Link></nav>
    </div></footer>
  </main>
}
