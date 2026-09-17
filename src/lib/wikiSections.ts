export type WikiSection = { title: string; content: string }

export function validateWikiSections(value: unknown): asserts value is WikiSection[] | undefined {
  if (value === undefined) return
  if (!Array.isArray(value) || value.length > 30) throw new Error('Adicione até 30 blocos por página.')
  for (const section of value) {
    if (!section || typeof section.title !== 'string' || !section.title.trim() || section.title.length > 120 || typeof section.content !== 'string' || !section.content.trim() || section.content.length > 50000) throw new Error('Cada bloco precisa de título (até 120 caracteres) e texto (até 50.000 caracteres).')
  }
  if (JSON.stringify(value).length > 500000) throw new Error('Os blocos excedem o limite de 500.000 caracteres.')
}

export function getWikiSections(data: Record<string, unknown>): WikiSection[] {
  return Array.isArray(data.sections) ? data.sections.filter((section): section is WikiSection => !!section && typeof section.title === 'string' && typeof section.content === 'string') : []
}

export function moveWikiSection<T>(sections: T[], index: number, step: number): T[] {
  const target = index + step
  if (index < 0 || index >= sections.length || target < 0 || target >= sections.length) return sections
  const next = [...sections]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
