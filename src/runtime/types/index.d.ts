import { Prisma } from "@prisma/client";
declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    prisma: {
      clientOptions?: Prisma.Subset<
        Prisma.PrismaClientOptions,
        Prisma.PrismaClientOptions
      >;
    };
  }
}
