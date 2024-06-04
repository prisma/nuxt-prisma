import { useNuxtApp } from '#imports'
import type { PrismaClient } from '@prisma/client'

export const usePrismaClient = () => {
  return useNuxtApp().$prisma as PrismaClient
}
