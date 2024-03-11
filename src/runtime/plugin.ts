import { PrismaClient } from '@prisma/client'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'prisma-client',
  enforce: 'pre',
  async setup() {
    const { log, errorFormat } = useRuntimeConfig().public.prisma
    const prisma = new PrismaClient({ log, errorFormat })
    return {
      provide: {
        prisma: prisma,
      },
    }
  },
})
