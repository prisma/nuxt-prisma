import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule
  ],
  prisma: {
    skipPrompts: true,
    autoSetupPrisma: true,
    installStudio: false,
  },
  compatibilityDate: '2025-10-11',
})
