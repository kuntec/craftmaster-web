import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Admin routes ──────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminToken = req.cookies.get('admin_token')?.value
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Redirect logged-in admin away from login
  if (pathname === '/admin/login') {
    const adminToken = req.cookies.get('admin_token')?.value
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  // ── Dashboard routes ──────────────────────────
  if (pathname.startsWith('/dashboard')) {
    const token = req.cookies.get('cm_token')?.value
    if (!token) {
      const url = new URL('/login', req.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  if (req.cookies.get('cm_token')?.value &&
    (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|samples).*)'],
}