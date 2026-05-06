import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function getGymFromRequest(request: NextRequest) {
  // 1. Get hostname from various headers
  // x-forwarded-host is preferred as it's set by proxies like Vercel
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  
  // Remove port if present (for localhost testing)
  let hostname = host.split(':')[0].toLowerCase()

  if (!hostname) return null

  // Define our root domains to differentiate subdomains from custom domains
  const ROOT_DOMAIN = 'gympilotpro.com'
  const VERCEL_DOMAIN = 'vercel.app'

  // Normalize: Is this a "root-like" domain where we should expect path-based routing?
  const isRoot = hostname === ROOT_DOMAIN || 
                 hostname === `www.${ROOT_DOMAIN}` || 
                 hostname === 'localhost' || 
                 hostname === '127.0.0.1' ||
                 hostname.endsWith(VERCEL_DOMAIN)

  // 2. Try identification by domain/subdomain first
  let searchIdentifier = ''
  
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    searchIdentifier = hostname.replace(`.${ROOT_DOMAIN}`, '')
  } else if (hostname.endsWith(`.${VERCEL_DOMAIN}`)) {
    searchIdentifier = hostname.replace(`.${VERCEL_DOMAIN}`, '')
  } else if (!isRoot) {
    // Custom domain (remove www. for the search)
    searchIdentifier = hostname.replace(/^www\./, '')
  }

  if (searchIdentifier) {
    const gym = await prisma.gym.findFirst({
      where: {
        OR: [
          { slug: searchIdentifier },
          { customDomain: searchIdentifier },
          { customDomain: `www.${searchIdentifier}` }
        ]
      }
    })
    
    if (gym) return gym
  }

  // 3. Fallback: Always try to get the gym from the Referer's path
  // This is critical for root-domain path routing (e.g. gympilotpro.com/slug/reset-password)
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const pathParts = refererUrl.pathname.split('/').filter(Boolean)
      
      // The first part of the path is usually the slug in path-based routing
      if (pathParts.length > 0) {
        const pathSlug = pathParts[0]
        
        // Skip reserved system paths to avoid unnecessary DB hits
        const reserved = [
          'api', 'plans', 'get-started', 'saas-admin', 'saas-login', 
          'login', 'signup', 'forgot-password', 'reset-password',
          'setup', 'verify', 'billing', 'settings', 'dashboard',
          'profile', 'renew-membership', 'payment', 'trainer',
          'secretary', 'admin', 'user', 'auth', 'memberships',
          'members', 'checkin', 'webhooks', 'upload', 'gyms',
          'cron', 'demo-booking', 'domain', 'favicon.ico'
        ]
        
        if (!reserved.includes(pathSlug)) {
          const gym = await prisma.gym.findFirst({
            where: { slug: pathSlug }
          })
          if (gym) return gym
        }
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  return null
}
