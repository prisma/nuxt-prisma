import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import { PrismaClient } from '@prisma/client';

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * Database connection string to connect to your database.
   * @default process.env.DATABASE_URL
   * @example 'file:./dev_qa.db'	
   * @type string
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#datasourceurl
   */
  datasourceUrl: string;

  /**
   * Determines the type and level of logging to the console.
   * @default []
   * @example ['query', 'info']
   * @type string[]
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#log
   */
  log?: string[];

  /**
   * Determines the level of error formatting.
   * @default 'colorless'
   * @type string
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#errorformat
   */
  errorFormat?: string;

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
    datasourceUrl: process.env.DATABASE_URL as string,
    log: [],
    errorFormat: 'colorless'
  },
  // Shorthand sugar to register Nuxt hooks
  hooks: {},
  // The function holding your module logic, it can be asynchronous
  setup(options, nuxt) {
    const prisma = new PrismaClient(options)
    const { resolve } = createResolver(import.meta.url)

    //Public runtimeConfig
    nuxt.options.runtimeConfig.public.prisma = defu(nuxt.options.runtimeConfig.public.prisma, {
      log: options.log,
      errorFormat: options.errorFormat
    })

    // Private runtimeConfig
    nuxt.options.runtimeConfig.prisma = defu(nuxt.options.runtimeConfig.prisma, {
      datasourceUrl: options.datasourceUrl
    })

    //add prisma plugin 
    addPlugin(resolve('./runtime/plugin'))
    
  }
})
