import { PrismaClient } from '../../generated/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export function usePrisma(): PrismaClient {
  if (import.meta.client) {
    throw new Error('usePrisma() is server-only. Call it in server code or server routes.')
  }
  return prisma
}
