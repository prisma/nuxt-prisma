export default defineNuxtConfig({
  modules: ['../src/module'],
  prisma: {
    init: {
      db: true,
    },
  },
  devtools: { enabled: true },
})
