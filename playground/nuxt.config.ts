export default defineNuxtConfig({
  modules: ["../src/module"],
  prisma: {
    installCLI: true,
  },
  experimental: {
    componentIslands: true,
  },
  devtools: { enabled: true },
});
