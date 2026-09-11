function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function mergeEntityData(existing: Record<string, unknown>, patch: Record<string, unknown>) {
  const result = { ...existing }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete result[key]
    else if (key !== 'media' && !(key in result) && (value === false || (Array.isArray(value) && value.length === 0) || (isRecord(value) && Object.keys(value).length === 0))) continue
    else if (isRecord(value) && isRecord(result[key])) result[key] = mergeEntityData(result[key] as Record<string, unknown>, value)
    else result[key] = value
  }
  return result
}

export function normalizeArchivedIds(ids: string[]) {
  const uniqueIds = [...new Set(ids)]
  if (!uniqueIds.length || uniqueIds.some((id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
    throw new Error('ids must contain valid UUIDs.')
  }
  return uniqueIds
}
