# Nuxt Prisma

[![npm version][npm-version-src]][npm-version-href] [![npm downloads][npm-downloads-src]][npm-downloads-href] [![License][license-src]][license-href] [![Nuxt][nuxt-src]][nuxt-href]

Are you a Nuxt developer? Or are you familiar with Prisma ORM and want to use it easily with Nuxt? Then this module is for you.

With this module, you can easily integrate Prisma ORM in your Nuxt app.

## Features

- Seamlessly set up Prisma CLI, Prisma schema, Prisma Migrate, and Prisma Client
- Easily access Prisma Studio within Nuxt DevTools
- Auto-imported `usePrismaClient()` composable for your Vue files

## Quick setup

1. Add `@prisma/nuxt` dependency to your project

   ```bash
   npm install @prisma/nuxt
   ```

2. Add `@prisma/nuxt` to the `modules` section of `nuxt.config.ts`

   ```ts
   export default defineNuxtConfig({
     modules: ["@prisma/nuxt"],
   });
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   Starting the development server will:

   1. Automatically install the [Prisma CLI](https://www.prisma.io/docs/orm/reference/prisma-cli-reference)
   2. Initialize a Prisma project with a SQLite database
   3. Create an User and Post example model in the Prisma Schema
   4. Prompt you to run a migration to create database tables with [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/overview)
   5. Install and generate a [Prisma Client](https://www.prisma.io/docs/orm/reference/prisma-client-reference)
   6. Prompt you to start the [Prisma Studio](https://www.prisma.io/docs/orm/tools/prisma-studio)

To learn more about how to use the module, visit our [documentation](https://pris.ly/prisma-nuxt)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@prisma/nuxt/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@prisma/nuxt
[npm-downloads-src]: https://img.shields.io/npm/dm/@prisma/nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/@prisma/nuxt
[license-src]: https://img.shields.io/npm/l/@prisma/nuxt.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@prisma/nuxt
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
