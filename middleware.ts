import { NextRequest, NextResponse } from 'next/server'

// Protected routes by role
const protectedRoutes: { path: string; roles: string[] }[] = [
  { path: '/member', roles: ['member'] },
  { path: '/trainer', roles: ['trainer'] },
  { path: '/secretary', roles: ['secretary'] },
  { path: '/admin', roles: ['admin'] },
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  const protectedRoute = protectedRoutes.find((route) => pathname.startsWith(route.path))

  if (protectedRoute) {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/member/:path*', '/trainer/:path*', '/secretary/:path*', '/admin/:path*'],
}
