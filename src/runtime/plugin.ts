import { defineNuxtPlugin } from "#imports";
import { PrismaClient } from "@prisma/client";

export default defineNuxtPlugin({
  name: "prisma-client",
  enforce: "pre",
  async setup() {
    const prisma = new PrismaClient();
    return {
      provide: {
        prisma: prisma,
      },
    };
  },
  env: {
    islands: true
  }
});
