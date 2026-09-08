import { NextResponse, type NextRequest } from 'next/server'

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin"',
    },
  })
}

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/search-index.json') return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'private, no-store' } })
  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'private, no-store')
  if (!req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/api/admin')) return response
  const secret = process.env.ADMIN_SECRET

  // Never allow open access to admin routes in production.
  if (!secret) {
    if (process.env.NODE_ENV === 'production') return unauthorized()
    // If not configured, don't block (dev friendliness)
    return response
  }

  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Basic ')) return unauthorized()

  try {
    const b64 = auth.slice('Basic '.length)
    const decoded = atob(b64)
    const [user, pass] = decoded.split(':')

    if (user !== 'admin' || pass !== secret) return unauthorized()

    return response
  } catch {
    return unauthorized()
  }
}

export const config = {
  matcher: ['/((?!_next/|images/|favicon.ico).*)'],
}
