import { getWikiSections, type WikiSection } from '@/lib/wikiSections'
import { WikiText } from './WikiText'

export function WikiSections({ data, sections = getWikiSections(data ?? {}) }: { data?: Record<string, unknown>; sections?: WikiSection[] }) {
  if (!sections.length) return null
  return <div className="my-8 space-y-10 text-slate-800">
    {sections.map((section, index) => <section key={index} className="min-w-0 break-words">
      <h2 className="mb-4 border-b border-stone-400/50 pb-2 font-cinzel text-2xl">{section.title}</h2>
      <div className="max-w-[70ch] space-y-4 whitespace-pre-wrap font-crimson text-xl leading-relaxed">
        {section.content.split(/\r?\n\s*\r?\n/).filter(Boolean).map((paragraph, i) => <p key={i}><WikiText text={paragraph} /></p>)}
      </div>
    </section>)}
  </div>
}
