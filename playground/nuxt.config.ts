export default defineNuxtConfig({
  modules: ["../src/module"],
  prisma: {
    autoSetupPrisma: true
  },
  experimental: {
    componentIslands: true,
  },
  devtools: { enabled: true },
});
