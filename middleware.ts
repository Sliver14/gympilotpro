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
  
  // Get hostname of request (e.g. demo.gympilotpro.com, gympilotpro.com, 192.168.1.15, or www.customdomain.com)
  let hostname = req.headers.get('host') || '';

  // Remove port if present (for localhost testing / mobile dev)
  hostname = hostname.split(':')[0].toLowerCase();

  // Define our root domain from env or default
  const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'gympilotpro.com';
  const VERCEL_DOMAIN = 'vercel.app'; // Useful if deployed on Vercel default domain

  // Normalize www.gympilotpro.com to gympilotpro.com
  if (hostname === `www.${ROOT_DOMAIN}`) {
    hostname = ROOT_DOMAIN;
  }

  // Check if request is from localhost, local IP (e.g. testing from iPhone on Wi-Fi), or preview tunnels
  const isLocalOrIp = 
    !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || // IPv4 LAN address (e.g. 192.168.x.x, 10.x.x.x)
    hostname.endsWith('.local') ||
    hostname.includes('ngrok') ||
    hostname.includes('loca.lt');

  // 1. Root domain / Landing page / Local testing
  if (hostname === ROOT_DOMAIN || hostname.endsWith(VERCEL_DOMAIN) || isLocalOrIp) {
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
  if (hostname && !hostname.includes(ROOT_DOMAIN)) {
    const normalizedDomain = hostname;
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', url.pathname);
    return NextResponse.rewrite(new URL(`/${normalizedDomain}${url.pathname}`, req.url), {
      request: { headers: requestHeaders }
    });
  }

  return NextResponse.next();
}

