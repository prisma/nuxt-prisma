export default defineNuxtConfig({
  modules: ["../src/module"],
  extends: ["./database"],
  prisma: {
    prismaRoot: "./database",
    prismaSchemaPath: "./database/prisma/schema.prisma",
  },
  experimental: {
    componentIslands: true,
  },
  devtools: { enabled: true },
});
