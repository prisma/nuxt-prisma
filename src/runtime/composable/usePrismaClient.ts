import { PrismaClient } from '@prisma/client'
import { useNuxtApp } from '#imports'

export const usePrismaClient = () => {
  return useNuxtApp().prisma as PrismaClient
}

