import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { defu } from 'defu'
import { Prisma } from '@prisma/client'
import { prompt } from 'prompts'
import * as execa from 'execa'

export interface ModuleOptions extends Prisma.PrismaClientOptions {
  /**
   * Database connection string to connect to your database.
   * @default process.env.DATABASE_URL //datasource url in your schema.prisma file	
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#datasourceurl
   */
  datasourceUrl?: string;

  /**
   * Determines the type and level of logging to the console.
   * @example ['query', 'info', 'warn', 'error']
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#log
   */
  log?: (Prisma.LogLevel | Prisma.LogDefinition)[]

  /**
   * Determines the level of error formatting.
   * @default "colorless"
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#errorformat
   */
  errorFormat?: Prisma.ErrorFormat
} 


export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@prisma/nuxt-prisma',
    // The key in `nuxt.config` that holds your module options
    configKey: 'prisma',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    datasourceUrl: process.env.DATABASE_URL as string,
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'colorless'
  } satisfies ModuleOptions,
  
  async setup(options, nuxt) {
    //@ts-ignore
    const { resolve } = createResolver(import.meta.url)

    const prompts = {
      installPrismaCliPrompt: undefined as any,
      initPrompt: undefined as any,
      generatePrompt: undefined as any,
      migratePrompt: undefined as any,
    }

    // Check CLI version 
    let prismaCliVersion;
    try {
      prismaCliVersion = await execa.execa('npx', ['prisma', 'version'])
    } catch (error) {
      console.log(error)
    }
    if (!prismaCliVersion){
      console.error('Prisma CLI is not installed')
      if (prompts.installPrismaCliPrompt) return
      prompts.installPrismaCliPrompt = prompt(
        {
          type: 'confirm',
          name: 'value',
          message: 'Do you want to install Prisma CLI?'
        }, 
        {
        //clear reference to prompt
        async onSubmit() {
          prompts.installPrismaCliPrompt = undefined
        },
        async onCancel() {
          prompts.installPrismaCliPrompt = undefined
          },
        },
      ) 
      // CLI installation
      const response = await prompts.installPrismaCliPrompt
      if (response?.value === true) {
        try {
          await execa.execaCommand('npm install prisma --save-dev')
          // Assuming you want to get the Prisma CLI version
          const prismaCliVersion = await execa.execa('npx', ['prisma', '--version'])
          console.log(prismaCliVersion)
        } catch (error) {
          console.error('Failed to install Prisma CLI')
        }     
      }
    }

    //Public runtimeConfig
    nuxt.options.runtimeConfig.public = defu(nuxt.options.runtimeConfig.public, {
      log: options.log,
      errorFormat: options.errorFormat
    })

    // Private runtimeConfig
    nuxt.options.runtimeConfig.prisma = defu(nuxt.options.runtimeConfig.prisma, {
      datasourceUrl: options.datasourceUrl
    })

    // Add Prisma plugin 
    addPlugin(resolve('./runtime/plugin'))

  }

})
