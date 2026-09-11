/**
 * General browse page — gateway to all wiki content
 */

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { getEntityCounts } from '@/db/queries/entities'

export const dynamic = 'force-dynamic'

const categories = [
  { type: 'character', label: 'Personagens', href: '/characters', icon: 'game-icons:person', description: 'Heróis, vilões e figuras notáveis de Átrias' },
  { type: 'place', label: 'Lugares', href: '/places', icon: 'game-icons:castle', description: 'Cidades, reinos, florestas e ruínas' },
  { type: 'faction', label: 'Facções', href: '/factions', icon: 'game-icons:flag-objective', description: 'Ordens, guildas e organizações' },
  { type: 'item', label: 'Itens', href: '/items', icon: 'game-icons:crossed-swords', description: 'Armas, relíquias e artefatos' },
  { type: 'lore', label: 'Conhecimento', href: '/lore', icon: 'game-icons:scroll-unfurled', description: 'Histórias, mitos e sabedoria antiga' },
  { type: 'monster', label: 'Criaturas', href: '/monsters', icon: 'game-icons:spiked-dragon-head', description: 'Bestas e monstros que espreitam Átrias' },
  { type: 'other', label: 'Outros', href: '/others', icon: 'game-icons:archive-register', description: 'Registros que não se encaixam nas demais categorias' },
]

const extras = [
  { label: 'Mapa', href: '/map', icon: 'game-icons:treasure-map', description: 'O mapa do mundo de Átrias' },
  { label: 'Sessões', href: '/sessions', icon: 'game-icons:quill-ink', description: 'Crônicas das aventuras registradas por Thaveus' },
  { label: 'Mesa de Dados', href: '/dice', icon: 'game-icons:rolling-dices', description: 'Role dados 3D, prepare combinações e invoque a sorte' },
]

export default async function BrowsePage() {
  const stats = await getEntityCounts()
  const countMap: Record<string, number> = { character: stats.characters, place: stats.places, faction: stats.factions, item: stats.items, lore: stats.lore, monster: stats.monsters, other: stats.others }

  return (
    <main className="min-h-screen flex flex-col bg-[#e8dcc8]">


      <div className="w-full max-w-6xl mx-auto px-6 pt-6 pb-12 sm:pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Navegação estrutural" className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Link href="/" className="hover:text-amber-700">Home</Link>
          <span>›</span>
          <span aria-current="page" className="text-slate-800">Arquivos</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="min-w-0">
            <h1 className="font-cinzel text-3xl leading-tight text-balance text-slate-800 sm:text-4xl">Arquivos de Átrias</h1>
            <p className="mt-2 font-manuscript text-base leading-relaxed italic text-slate-600">Tudo que foi registrado pelo Escriba</p>
          </div>
          {process.env.WIKI_EDITING_ENABLED !== 'false' && <Link href="/wiki/others/new" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded border border-amber-800/40 px-4 py-2 font-semibold text-amber-800 hover:bg-white/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800">Adicionar registro</Link>}
        </div>

        {/* Entity Categories */}
        <nav aria-label="Categorias dos arquivos" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.type}
              href={cat.href}
              className="group bg-white/80 rounded-lg p-4 sm:p-6 border border-amber-800/20 hover:border-amber-700 hover:bg-white transition-colors last:col-span-full last:border-transparent last:bg-transparent last:py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800"
            >
              <div className="flex items-start gap-4">
                <Icon icon={cat.icon} className="mt-1 h-8 w-8 shrink-0 text-amber-800" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <h2 className="font-cinzel text-lg leading-snug sm:text-xl text-slate-800 group-hover:text-amber-800 transition-colors">
                      {cat.label}
                    </h2>
                    <span className="shrink-0 text-sm leading-6 text-amber-800 tabular-nums">
                      {countMap[cat.type] || 0}
                    </span>
                  </div>
                  <p className="mt-2 font-crimson text-base leading-6 text-slate-600">{cat.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </nav>

        {/* Extra sections */}
        <nav aria-label="Exploração e ferramentas" className="mt-6 grid gap-4 border-t border-amber-800/20 pt-6 md:grid-cols-2">
          {extras.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-lg p-4 sm:px-6 hover:bg-white/40 transition-colors last:col-span-full last:rounded-none last:border-t last:border-amber-800/20 last:pt-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800"
            >
              <div className="flex items-start gap-4">
                <Icon icon={item.icon} className="h-8 w-8 shrink-0 text-amber-800" />
                <div className="min-w-0">
                  <h2 className="font-cinzel text-lg leading-snug sm:text-xl text-slate-800 decoration-amber-800 underline-offset-4 group-hover:underline">
                    {item.label}
                  </h2>
                  <p className="mt-2 font-crimson text-base leading-6 text-slate-600">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-[#0a1628] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mx-auto max-w-prose font-manuscript text-base leading-relaxed italic text-amber-200/80">
            &quot;Cada entrada é uma página no Livro das Estórias Não Contadas.&quot;
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-400">Wiki Átrias © 2026</p>
        </div>
      </footer>
    </main>
  )
}
