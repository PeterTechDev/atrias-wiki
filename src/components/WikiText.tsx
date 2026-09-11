import Link from 'next/link'
import { parseWikiLinks } from '@/lib/wikiLinks'

export function WikiText({ text }: { text: string }) {
  return <>{parseWikiLinks(text).map((part, index) => part.href
    ? <Link key={index} href={part.href} className="underline decoration-current underline-offset-4 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2">{part.text}</Link>
    : part.text)}</>
}
