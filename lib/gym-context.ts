import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function getGymFromRequest(request: NextRequest) {
  // 1. Try to get the gym slug from the request headers set by middleware
  let gymSlug = request.headers.get('x-gym-slug')

  // 2. Alternatively, try to parse it from the Host header (for subdomains)
  if (!gymSlug) {
    const host = request.headers.get('host') || ''
    const parts = host.split('.')
    if (parts.length > 2 || (parts.length === 2 && !host.includes('localhost'))) {
      // Basic subdomain extraction
      const potentialSubdomain = parts[0]
      if (potentialSubdomain !== 'www' && potentialSubdomain !== 'localhost') {
        gymSlug = potentialSubdomain
      }
    }
  }

  // 3. Alternatively, try to parse it from the Referer header
  if (!gymSlug) {
    const referer = request.headers.get('referer')
    if (referer) {
      try {
        const refererUrl = new URL(referer)
        const host = refererUrl.host
        const parts = host.split('.')
        if (parts.length > 2) {
          gymSlug = parts[0]
        }
      } catch (e) {
        // Ignore invalid referer
      }
    }
  }

  if (gymSlug) {
    const gym = await prisma.gym.findUnique({
      where: { slug: gymSlug }
    })
    
    if (gym) return gym
  }

  return null
}
