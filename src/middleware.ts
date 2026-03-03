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
  const secret = process.env.ADMIN_SECRET

  // Never allow open access to admin routes in production.
  if (!secret) {
    if (process.env.NODE_ENV === 'production') return unauthorized()
    // If not configured, don't block (dev friendliness)
    return NextResponse.next()
  }

  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Basic ')) return unauthorized()

  try {
    const b64 = auth.slice('Basic '.length)
    const decoded = atob(b64)
    const [user, pass] = decoded.split(':')

    if (user !== 'admin' || pass !== secret) return unauthorized()

    return NextResponse.next()
  } catch {
    return unauthorized()
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
