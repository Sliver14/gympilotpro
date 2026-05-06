import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function getGymFromRequest(request: NextRequest) {
  // 1. Get hostname from Host header or Referer
  let hostname = request.headers.get('host') || ''
  
  if (!hostname || hostname === 'localhost:3000') {
    const referer = request.headers.get('referer')
    if (referer) {
      try {
        const refererUrl = new URL(referer)
        hostname = refererUrl.host
      } catch (e) {
        // Ignore invalid referer
      }
    }
  }

  // Remove port if present
  hostname = hostname.split(':')[0].toLowerCase()

  if (!hostname) return null

  // Define our root domains to differentiate subdomains from custom domains
  const ROOT_DOMAIN = 'gympilotpro.com'
  const VERCEL_DOMAIN = 'vercel.app'

  let searchIdentifier = ''
  let isSubdomain = false

  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    searchIdentifier = hostname.replace(`.${ROOT_DOMAIN}`, '')
    isSubdomain = true
  } else if (hostname.endsWith(`.${VERCEL_DOMAIN}`)) {
    searchIdentifier = hostname.replace(`.${VERCEL_DOMAIN}`, '')
    isSubdomain = true
  } else if (hostname !== ROOT_DOMAIN && hostname !== 'localhost') {
    // It's a custom domain (e.g., www.klimarsspace.com or klimarsspace.com)
    searchIdentifier = hostname
    isSubdomain = false
  }

  if (searchIdentifier) {
    const cleanDomain = searchIdentifier.replace(/^www\./, '')
    
    const gym = await prisma.gym.findFirst({
      where: {
        OR: [
          { slug: searchIdentifier },
          { slug: cleanDomain },
          { customDomain: searchIdentifier },
          { customDomain: cleanDomain },
          { customDomain: `www.${cleanDomain}` }
        ]
      }
    })
    
    if (gym) return gym
  }

  // Fallback: If we're on the root domain, localhost, or vercel domain, 
  // try to get the gym from the referer's path (e.g. gympilotpro.com/slug/reset-password)
  if (hostname === ROOT_DOMAIN || hostname === 'localhost' || hostname.endsWith(VERCEL_DOMAIN)) {
    const referer = request.headers.get('referer')
    if (referer) {
      try {
        const refererUrl = new URL(referer)
        const pathParts = refererUrl.pathname.split('/').filter(Boolean)
        
        // The first part of the path is usually the slug in path-based routing
        if (pathParts.length > 0) {
          const pathSlug = pathParts[0]
          
          // Only attempt if it's not a reserved word (optional optimization)
          const reserved = ['api', 'plans', 'get-started', 'saas-admin', 'saas-login']
          if (!reserved.includes(pathSlug)) {
            const gym = await prisma.gym.findFirst({
              where: { slug: pathSlug }
            })
            if (gym) return gym
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }

  return null
}

