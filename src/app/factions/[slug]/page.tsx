import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUp, BookOpen, ChevronRight, Feather } from 'lucide-react'
import { getEntityBySlug } from '@/db/queries/entities'
import type { FactionData } from '@/types/entities'
import { WikiText } from '@/components/WikiText'
import { WikiContributionActions } from '@/components/WikiContributionActions'
import { WikiLastEdited } from '@/components/WikiLastEdited'
import { WikiFavoriteButton } from '@/components/WikiFavoriteButton'
import styles from '../../characters/[slug]/character.module.css'

export const dynamic = 'force-dynamic'

export default async function FactionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entity = await getEntityBySlug('faction', slug)
  if (!entity) notFound()

  const data = (entity.data ?? {}) as FactionData
  const facts = [
    { label: 'Sede', value: data.headquarters },
    { label: 'Líder', value: data.leader },
    { label: 'Alinhamento', value: data.alignment },
  ].filter(fact => fact.value)
  const references = [
    { id: 'dominios', label: 'Domínios', items: data.domains ?? [] },
    { id: 'portfolio', label: 'Portfólio', items: data.portfolio ?? [] },
    { id: 'objetivos', label: 'Objetivos', items: data.goals ?? [] },
  ].filter(section => section.items.length > 0)
  const sections = [
    { id: 'historia', label: 'História' },
    ...references,
  ]

  return <main id="inicio" className={styles.page}>
    <div className={styles.container}>
      <nav aria-label="Caminho da página" className={styles.breadcrumb}>
        <Link href="/">Início</Link><ChevronRight aria-hidden="true" size={14} />
        <Link href="/factions">Facções</Link><ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page">{entity.name}</span>
      </nav>

      <header className="py-8 md:py-12">
        <div className={styles.identity}>
          <h1>{entity.name}</h1>
          <div className={styles.actions}>
            <WikiFavoriteButton entityId={entity.id} />
            <WikiContributionActions collection="factions" slug={slug} entityId={entity.id} subtle enabled={process.env.WIKI_EDITING_ENABLED !== 'false'} />
          </div>
        </div>
        {!!facts.length && <dl aria-label="Ficha da facção" className={`${styles.facts} mt-8 md:grid-cols-3`}>
          {facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd><WikiText text={fact.value!} /></dd></div>)}
        </dl>}
      </header>

      {sections.length > 1 && <nav className={styles.sectionNav} aria-label="Nesta página">
        <span>Nesta página</span>
        <div>{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</div>
      </nav>}

      <div className={`${styles.content} ${!references.length ? styles.withoutReference : ''}`}>
        <article id="historia" aria-labelledby="history-title" className={styles.story}>
          <h2 id="history-title"><Feather aria-hidden="true" size={22} />História</h2>
          {entity.description ? <div className={styles.prose}>
            {entity.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}><WikiText text={paragraph} /></p>)}
          </div> : <p className={styles.empty}>A história desta facção ainda não foi registrada.</p>}
        </article>

        {!!references.length && <aside aria-label="Referência da facção" className={styles.reference}>
          {references.map(section => <section id={section.id} key={section.id} aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`}>{section.label}</h2>
            <ul>{section.items.map((item, index) => <li key={index}><WikiText text={item} /></li>)}</ul>
          </section>)}
        </aside>}
      </div>

      <div className={styles.endmatter}>
        <WikiLastEdited entity={entity} />
        <div className={styles.endLinks}>
          <Link href="/factions"><ArrowLeft aria-hidden="true" size={16} />Todas as facções</Link>
          <a href="#inicio">Voltar ao início<ArrowUp aria-hidden="true" size={16} /></a>
        </div>
      </div>
    </div>

    <footer className={styles.footer}>
      <BookOpen aria-hidden="true" size={20} /><span className="font-cinzel">Wiki Átrias</span>
      <span>Lealdade é a moeda mais valiosa entre aqueles que servem a uma causa maior.</span>
    </footer>
  </main>
}
