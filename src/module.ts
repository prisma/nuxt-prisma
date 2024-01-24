import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import { PrismaClient } from '@prisma/client';

// Module options TypeScript interface definition
export interface ModuleOptions {
  datasourceUrl: string
  log: string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    // Usually the npm package name of your module
    name: '@prisma/nuxt-prisma',
    // The key in `nuxt.config` that holds your module options
    configKey: 'nuxtPrisma',
    // Compatibility constraints
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  // Default configuration options for your module, can also be a function returning those
  defaults: {
    datasourceUrl: process.env.DATABASE_URL,
    log: ['query', 'info', 'warn', 'error'],
  },
  // Shorthand sugar to register Nuxt hooks
  hooks: {},
  // The function holding your module logic, it can be asynchronous
  setup(options, nuxt) {
    const prisma = new PrismaClient()//not sure if it goes here or if there's a shorthand way of doing this

    const { resolve } = createResolver(import.meta.url)

    //public runtimeConfig
    nuxt.options.runtimeConfig.public.prisma = defu(nuxt.options.runtimeConfig.public.prisma, {
      datasourceUrl: options.datasourceUrl,
      log: options.log,
    })

    //add prisma plugin 
    addPlugin(resolve('./runtime/plugin'))
    
  }
})
