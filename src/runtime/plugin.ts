import { defineNuxtPlugin } from "#imports";
import prisma from "./utils/prisma"

export default defineNuxtPlugin({
  name: "prisma-client",
  enforce: "pre",
  async setup() {
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
