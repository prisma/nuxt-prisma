import nuxt from '@nuxt/eslint-config'

export default nuxt({
  ignores: [
    'dist',
    'node_modules',
    '.nuxt',
    'playground/.nuxt',
    'playground/node_modules',
    'playground/dist',
    '*.config.js',
    '*.config.mjs',
    '*.config.cjs',
  ],
})
