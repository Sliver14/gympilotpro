import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. demo.gympilotpro.com, gympilotpro.com, or www.customdomain.com)
  let hostname = req.headers.get('host') || '';

  // Remove port if present (for localhost testing)
  hostname = hostname.split(':')[0].toLowerCase();

  // Define our root domains
  const ROOT_DOMAIN = 'gympilotpro.com';
  const VERCEL_DOMAIN = 'vercel.app'; // Useful if deployed on Vercel default domain

  // Normalize www.gympilotpro.com to gympilotpro.com
  if (hostname === `www.${ROOT_DOMAIN}`) {
    hostname = ROOT_DOMAIN;
  }

  // 1. Root domain / Landing page
  if (hostname === ROOT_DOMAIN || hostname.endsWith(VERCEL_DOMAIN) || hostname === 'localhost') {
    return NextResponse.next();
  }

  // 2. Subdomains (e.g., klimarx.gympilotpro.com)
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, '');
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', url.pathname);
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url), {
      request: { headers: requestHeaders }
    });
  }

  // 3. Custom Domains (e.g., klimarxgym.com)
  const normalizedDomain = hostname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', url.pathname);
  return NextResponse.rewrite(new URL(`/${normalizedDomain}${url.pathname}`, req.url), {
    request: { headers: requestHeaders }
  });
}
