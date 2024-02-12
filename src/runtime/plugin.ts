import { defineNuxtPlugin } from '#app'
import { useRuntimeConfig } from '#imports'
import { PrismaClient, Prisma } from '@prisma/client'

export default defineNuxtPlugin({
  name: 'prisma',
  enforce: 'pre',
  async setup (nuxtApp) {
    const options = useRuntimeConfig().public.prisma
    const prismaOptions = {
      ...options, 
    } satisfies Prisma.PrismaClientOptions
    const prismaClient = new PrismaClient(prismaOptions) 

    nuxtApp.provide('prisma', prismaClient)
  
  },
  
})
