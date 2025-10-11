import type { Prisma } from "@prisma/client";
import type { CustomPrismaClient } from "../server/utils/prisma";

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

declare module '#app' {
  interface NuxtApp {
    $prisma: CustomPrismaClient;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $prisma: CustomPrismaClient;
  }
}
