import { prisma } from './prisma'
import { headers } from 'next/headers'

export async function getClientIP() {
  const headerList = await headers()
  const forwardedFor = headerList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return '127.0.0.1'
}

/**
 * Basic database-backed rate limiting for serverless environments.
 * @param key Unique identifier for the rate limit (e.g. "forgot-password:user@example.com")
 * @param limit Maximum number of attempts allowed within the window
 * @param windowSeconds Time window in seconds
 * @returns Object with success status and metadata
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date()
  
  try {
    const record = await prisma.rateLimit.findUnique({
      where: { key }
    })

    if (!record || record.resetAt < now) {
      // Create new window or reset expired one
      const resetAt = new Date(now.getTime() + windowSeconds * 1000)
      
      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          resetAt
        },
        update: {
          count: 1,
          resetAt
        }
      })
      return { success: true, remaining: limit - 1, resetAt }
    }

    if (record.count >= limit) {
      return { success: false, remaining: 0, resetAt: record.resetAt }
    }

    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 }
      }
    })

    return { success: true, remaining: limit - updated.count, resetAt: record.resetAt }
  } catch (error) {
    console.error('Rate limit error:', error)
    // Fail open to avoid blocking users if DB is down
    return { success: true, remaining: 1, resetAt: now }
  }
}
