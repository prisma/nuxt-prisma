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

1. Add `test-nuxt-prisma` dependency to your project

    ```bash
    npm install --save-dev test-nuxt-prisma
    ```

2. Add `test-nuxt-prisma` to the `modules` section of `nuxt.config.ts`

    ```ts
    export default defineNuxtConfig({
      modules: [
        'test-nuxt-prisma'
      ]
    })
    ```

3. Activate the module prompts for setting up Prisma ORM:

    ```bash
    npm run dev
    
    ```

## Options
You can pass in options to configure the module within the `nuxt.config.ts` file.

```js
export default defineNuxtConfig({
  modules: [
    'test-nuxt-prisma'
  ],
  prisma: {
    /* default module options */
    datasourceUrl: process.env.DATABASE_URL,
    log: [],
    errorFormat: 'colorless',
  }
})
```

| **Module Options**    | **Default**                | **Description**                           |
|-----------------------|----------------------------|------------------------------------------ |
| datasourceUrl         | `process.env.DATABASE_URL` | Database connection string                |
| log                   | `[]`                       | Determines console logging type and level |
| errorFormat           | `'colorless'`              | Determines the level of error formatting. |

##  Usage
This module provides you with an instance of [Prisma Client](https://www.prisma.io/docs/orm/reference/prisma-client-reference) to query your database. There are two approaches for accessing this Prisma Client instance:

### Option A: `lib/prisma.ts`
This file creates a global instance of Prisma Client:

```ts
// lib/prisma.ts 
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }
    
export const prisma = globalForPrisma.prisma || new PrismaClient()
    
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
    
export default prisma
```

We recommend importing this instance into the script tags of your `.vue` files like so: 

```vue
<script lang="ts" setup>
// Importing prisma instance from lib/prisma.ts
import { prisma } from '~/lib/prisma'

  async function main() {
    const posts = await prisma.post.findMany()
    console.log(posts)
  }
  main()
</script>
```

You can customize Prisma Client's capabilities by using [client extensions](https://www.prisma.io/docs/orm/prisma-client/client-extensions) in your `lib/prisma.ts` file. 
Here is an example using [`prisma-extension-random`](https://github.com/nkeil/prisma-extension-random): 

```ts
// lib/prisma.ts 
import { PrismaClient } from "@prisma/client"
// Import extension after installing
import prismaRandom from 'prisma-extension-random'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
    
// use .$extends method on PrismaClient()
export const prisma = globalForPrisma.prisma || new PrismaClient().$extends(prismaRandom())
    
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
    
export default prisma
```

Here is an example usage of your `prisma` instance with the extension in your `.vue` file: 

```vue
<script lang="ts" setup>
// app.vue file
import { prisma } from '~/lib/prisma'
  async function main() {
    // Use findRandom() method
    const posts = await prisma.post.findRandom() 
    console.log(posts)
  }
  main()
</script>
```

### Option B: `usePrismaClient()`
This module exposes a [Nuxt composable](https://nuxt.com/docs/guide/directory-structure/composables) that is auto-imported inside your Vue files.

This composable is using [Prisma Client](https://www.prisma.io/docs/orm/reference/prisma-client-reference) under the hood via a Nuxt plugin. It gives access to the Prisma Client in your Vue components. 

```vue
<script lang="ts" setup>
  async function main() {
    const prisma = usePrismaClient()
    const posts = await prisma.post.findMany()
    console.log(posts)
  }
  main()
</script>
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
