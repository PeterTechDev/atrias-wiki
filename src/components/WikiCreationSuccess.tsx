'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { BookOpenCheck } from 'lucide-react'
import styles from './WikiCreationSuccess.module.css'

export function WikiCreationSuccess({ name, destination, collection, isSpoiler }: {
  name: string
  destination: string
  collection: string
  isSpoiler: boolean
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])

  return <section aria-labelledby="creation-success" className="space-y-6 py-3 text-[#49391f]">
    <div className="flex items-center gap-3">
      <BookOpenCheck aria-hidden="true" className={`${styles.mark} h-8 w-8 shrink-0 text-amber-800`} />
      <h2 id="creation-success" ref={heading} tabIndex={-1} className="text-xl font-semibold outline-none">Página criada</h2>
    </div>
    <div className="space-y-3">
      <p className="font-cinzel text-3xl leading-snug [overflow-wrap:anywhere] sm:text-4xl">{name}</p>
      <p className="font-crimson text-xl italic">Mais uma página na história de Átrias. Obrigado por registrá-la.</p>
    </div>
    <div className="space-y-2 border-y border-[#9b814d]/50 py-4 text-sm leading-relaxed">
      <p>{isSpoiler ? 'Somente mestres podem acessar.' : 'A página está visível para todos.'}</p>
      <p>Você pode continuar editando e acrescentar detalhes quando quiser.</p>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Link href={destination} className="wiki-button wiki-button-primary">Ver página</Link>
      <Link href={`/wiki${destination}/edit`} className="wiki-button">Continuar editando</Link>
      {/* A new document resets the form and its unsaved-changes guard. */}
      <a href={`/wiki/${collection}/new`} className="wiki-button wiki-button-quiet">Adicionar outra página</a>
    </div>
  </section>
}
