# Nuxt Prisma

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Integrate Prisma ORM in your Nuxt app.

<!-- - [✨ &nbsp;Release Notes](/CHANGELOG.md) -->
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
- [📖 &nbsp;Documentation](https://nuxt-prisma-five.vercel.app/)

## Features

- Seamlessly set up Prisma CLI, Prisma schema, Prisma Migrate, and Prisma Client
- Easily access Prisma Studio within Nuxt DevTools
- Auto-imported `usePrismaClient()` composable for your Vue files

## Quick Setup

1. Add `nuxt-prisma` dependency to your project

```bash
# Using npm
npm install --save-dev nuxt-prisma

# Using pnpm
pnpm add -D nuxt-prisma

# Using yarn
yarn add --dev nuxt-prisma

```

2. Add `nuxt-prisma` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-prisma'
  ]
})
```
That's it! You can now use the `nuxt-prisma` module in your Nuxt app ✨

## Options
You can pass in options to configure the module within the `nuxt.config.ts` file.

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-prisma'
  ],
  prisma: {
    /* default module options */
    datasourceUrl: process.env.DATABASE_URL,
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'colorless',
  }
})
```

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
