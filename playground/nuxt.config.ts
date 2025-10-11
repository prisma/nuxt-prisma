export default defineNuxtConfig({
  modules: ["../src/module"],
  compatibilityDate: "2025-10-11",
  prisma: {
    prismaRoot: "./database",
    prismaSchemaPath: "./database/prisma/schema.prisma",
  },
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
});
