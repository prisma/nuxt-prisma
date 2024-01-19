// import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions { }

import { defineNuxtModule } from '@nuxt/kit'
import { PrismaClient } from '@prisma/client';


export default defineNuxtModule({
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
  defaults: {},
  // Shorthand sugar to register Nuxt hooks
  hooks: {},
  // The function holding your module logic, it can be asynchronous
  setup(moduleOptions, nuxt) {
    const client = new PrismaClient(moduleOptions);
    return client
  }
})
