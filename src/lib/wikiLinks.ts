export function parseWikiLinks(text: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = []
  const pattern = /\[((?:\\.|[^\]\\\n])+)\]\((\/(?:characters|places|factions|items|lore|monsters|deities|others)\/[a-z0-9]+(?:-[a-z0-9]+)*)\)/g
  let cursor = 0
  for (const match of text.matchAll(pattern)) {
    parts.push({ text: text.slice(cursor, match.index) })
    parts.push({ text: match[1].replace(/\\([\\[\]])/g, '$1'), href: match[2] })
    cursor = match.index + match[0].length
  }
  parts.push({ text: text.slice(cursor) })
  return parts
}

export function insertWikiLink(value: string, start: number, end: number, name: string, href: string) {
  const label = (value.slice(start, end) || name).replace(/\r?\n/g, ' ').replace(/[\\[\]]/g, '\\$&')
  const link = `[${label}](${href})`
  return { value: value.slice(0, start) + link + value.slice(end), cursor: start + link.length }
}

function needsWordSpace(left: string, right: string) {
  return /[\p{L}\p{N}]$/u.test(left) && /^[\p{L}\p{N}]/u.test(right)
}

export function wikiLinkText(text: string) {
  let plain = ''
  for (const part of parseWikiLinks(text)) {
    if (!part.text) continue
    // A link written against the previous word, as in "Vellenor[O Protetorado](/…)",
    // has no space in the source. Previews flatten the label into the sentence, so
    // insert one only where two words would otherwise become a single token.
    if (plain && needsWordSpace(plain, part.text)) plain += ' '
    plain += part.text
  }
  return plain
}
