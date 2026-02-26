let prismaInstance: any = null

declare global {
  var prisma: any
}

function getPrismaInstance() {
  if (prismaInstance) return prismaInstance

  try {
    // Dynamically import to avoid build-time errors
    const { PrismaClient } = require('@prisma/client')
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  } catch (error) {
    console.error('[Prisma] Failed to initialize:', error)
    throw error
  }

  return prismaInstance
}

// Export a proxy that lazily initializes Prisma
export const prisma = new Proxy(
  {},
  {
    get: (target, prop) => {
      const instance = getPrismaInstance()
      return (instance as any)[prop]
    },
  }
) as any

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
