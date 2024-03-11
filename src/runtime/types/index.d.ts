import { Prisma } from '@prisma/client'
declare module '@nuxt/schema' {
    interface PublicRuntimeConfig {
        prisma: {
            log: (Prisma.LogLevel | Prisma.LogDefinition)[]
            errorFormat: Prisma.ErrorFormat
        }
    }
}
