export function isWikiAdmin(req: Request) {
  const secret = process.env.ADMIN_SECRET
  const header = req.headers.get('authorization')
  if (!secret || !header?.startsWith('Basic ')) return false
  try { return atob(header.slice(6)) === `admin:${secret}` } catch { return false }
}
