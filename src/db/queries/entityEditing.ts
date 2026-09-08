function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function mergeEntityData(existing: Record<string, unknown>, patch: Record<string, unknown>) {
  const result = { ...existing }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete result[key]
    else if (!(key in result) && (value === false || (Array.isArray(value) && value.length === 0) || (isRecord(value) && Object.keys(value).length === 0))) continue
    else if (isRecord(value) && isRecord(result[key])) result[key] = mergeEntityData(result[key] as Record<string, unknown>, value)
    else result[key] = value
  }
  return result
}
