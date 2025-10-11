import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    exclude: ['Nueva carpeta/**/*', '**/node_modules/**'],
  },
})