import { defineNuxtPlugin } from "#imports";

let prismaClient: any = null;

export default defineNuxtPlugin(async () => {
  // Only provide Prisma client on server-side
  if (import.meta.server && !prismaClient) {
    // Use dynamic import for better ESM compatibility
    const { default: prisma } = await import("./server/utils/prisma");
    prismaClient = prisma;
  }

  return {
    provide: {
      prisma: prismaClient,
    },
  };
});
