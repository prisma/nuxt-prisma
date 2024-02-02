<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: My Module
- Package name: my-module
- Description: My new Nuxt module
-->

# Nuxt Prisma

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Integrate [Nuxt](https://nuxt.com/) with [Prisma](https://www.prisma.io/)
- [✨ &nbsp;Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;later
- 🚠 &nbsp;later
- 🌲 &nbsp;later

## Quick Setup

1. Add `@prisma/nuxt-prisma` dependency to your project

```bash
# Using pnpm
pnpm add -D @prisma/nuxt-prisma

# Using yarn
yarn add --dev @prisma/nuxt-prisma

# Using npm
npm install --save-dev @prisma/nuxt-prisma
```

2. Add `@prisma/nuxt-prisma` to the `modules` section of `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: [
    '@prisma/nuxt-prisma'
  ]
})
```

That's it! You can now use Prisma in your Nuxt app ✨

## Module Options
You can configure the module by using the `prisma` property in your `nuxt.config.ts` file.

```ts
export default defineNuxtConfig({
  modules: ['@prisma/nuxt-prisma'],
  prisma: {
    // Options
  },
})
```

### datasourceURL

- **Default:** `process.env.DATABASE_URL`

Database connection string to connect to your database.

### log

- **Default:** `[]`

Determines the type and level of logging to the console.

### errorFormat

- **Default:** `'colorless'`

Determines the level of error formatting.

### adapter

- **Default:**

Defines an instance of a [driver adapter](https://www.prisma.io/docs/orm/overview/databases/database-drivers#driver-adapters).

*A full list of Prisma Client options can be found [here](https://www.prisma.io/docs/orm/reference/prisma-client-reference).*


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
[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/my-module

[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/my-module

[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/my-module

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
