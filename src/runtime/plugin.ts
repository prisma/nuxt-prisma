import { PrismaClient } from '@prisma/client'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'prisma-client',
  enforce: 'pre',
  async setup() {
    const prisma = new PrismaClient()
    return {
      provide: {
        prisma: prisma,
      },
    }
  },
})
