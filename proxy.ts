import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
}

export default async function proxy(req: NextRequest) {
  const url = req.nextUrl
  const host = req.headers.get('host') || ''
  
  // Remove port from host for subdomain check
  const hostname = host.split(':')[0]
  
  // Extract subdomain
  // This logic works for [subdomain].lvh.me and [subdomain].insightgym.com
  const parts = hostname.split('.')
  let subdomain = ''
  
  if (parts.length > 2) {
    // If it's something.domain.com, the first part is the subdomain
    subdomain = parts[0]
  } else if (parts.length === 2 && hostname.includes('lvh.me')) {
    // For lvh.me, it might be just lvh.me (no subdomain)
    subdomain = ''
  }

  // Treat 'www' as no subdomain
  if (subdomain === 'www') subdomain = ''

  // 1. If there is a subdomain, rewrite to the gym-specific routes
  if (subdomain && subdomain !== '') {
    const pathname = url.pathname
    
    // Auth check logic for subdomains
    const protectedPaths = ['/admin', '/member', '/trainer', '/secretary']
    const isProtected = protectedPaths.some(path => pathname.startsWith(path))

    if (isProtected) {
      const token = req.cookies.get('auth-token')?.value
      if (!token) {
        return NextResponse.redirect(new URL(`/login`, req.url))
      }
    }

    // Pass the subdomain downstream via headers
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-gym-slug', subdomain)

    // Rewrite to the internal /[subdomain] path
    // The folder structure is app/(gym)/[subdomain]/page.tsx
    // Next.js matches /[subdomain]/...
    return NextResponse.rewrite(new URL(`/${subdomain}${pathname}`, req.url), {
      request: {
        headers: requestHeaders,
      }
    })
  }

  // 2. If no subdomain, serve the global SaaS landing page
  return NextResponse.next()
}
