export default defineNuxtConfig({
  modules: ["../src/module"],
  prisma: {},
  experimental: {
    componentIslands: true,
  },
  devtools: { enabled: true },
});
