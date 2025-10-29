# @prisma/nuxt - Rust-Free Edition

A modern Nuxt module for Prisma ORM that focuses on PostgreSQL database generation using the latest Rust-free Prisma features.

## 🚀 Features

- **Rust-Free Prisma Engine**: Uses the latest Prisma client without Rust binaries
- **Driver Adapters**: Support for PostgreSQL, Neon, PlanetScale, and more
- **PostgreSQL Focus**: Optimized for PostgreSQL development workflows
- **create-db Integration**: Automatic PostgreSQL setup using `npx create-db`
- **Docker Fallback**: Falls back to Docker if `create-db` is not available
- **Nuxt DevTools**: Integrated Prisma Studio in Nuxt DevTools
- **TypeScript Support**: Full TypeScript support with auto-generated types
- **Modern Architecture**: Built with Nuxt 3+ and latest Prisma features

## 📦 Installation

```bash
# Using npm
npm install @prisma/nuxt

# Using yarn
yarn add @prisma/nuxt

# Using pnpm
pnpm add @prisma/nuxt

   ```bash
   npm install @prisma/nuxt
   ```
   or run this to automatically inject `@prisma/nuxt` and skip step #2
   ```bash
   npx nuxi module add @prisma/nuxt 
   ```

## 🛠️ Setup

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@prisma/nuxt'],
  
  prisma: {
    database: {
      provider: 'postgresql',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'my_app',
    },
    prisma: {
      schemaPath: './prisma/schema.prisma',
      output: './generated/prisma',
      engineType: 'client',
      useDriverAdapter: true,
      driverAdapter: 'pg',
    },
    devtools: {
      enableStudio: true,
      studioPort: 5555,
    },
    setup: {
      autoSetup: false,
      skipPrompts: false,
      generateClient: true,
      runMigration: true,
      formatSchema: true,
    },
    runtime: {
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    },
  },
})
```

## 🔧 Configuration Options

### Database Configuration

```typescript
database: {
  provider: 'postgresql' | 'mysql' | 'sqlite' | 'sqlserver' | 'mongodb' | 'cockroachdb',
  host?: string,
  port?: number,
  username?: string,
  password?: string,
  database?: string,
  url?: string, // Direct connection string
}
```

### Prisma Configuration

```typescript
prisma: {
  schemaPath?: string,        // Path to schema file
  output?: string,           // Output directory for generated client
  engineType?: 'client' | 'library',
  useDriverAdapter?: boolean,
  driverAdapter?: 'pg' | 'better-sqlite3' | 'd1' | 'mariadb' | 'planetscale' | 'mssql' | 'neon',
}
```

### Development Tools

```typescript
devtools: {
  enableStudio?: boolean,    // Enable Prisma Studio
  studioPort?: number,      // Port for Prisma Studio
}
```

### Setup Options

```typescript
setup: {
  autoSetup?: boolean,       // Auto-setup without prompts
  skipPrompts?: boolean,    // Skip all prompts
  generateClient?: boolean, // Generate Prisma client
  runMigration?: boolean,  // Run database migrations
  formatSchema?: boolean,   // Format Prisma schema
}
```

## 🎯 Usage

### Using the Prisma Client

```vue
<script setup>
// In server components
const prisma = usePrismaClient()
const posts = await prisma.post.findMany()

// With configuration
const { client: prisma, config } = usePrismaConfig()
</script>
```

### Server API Routes

```typescript
// server/api/posts.get.ts
export default defineEventHandler(async (event) => {
  const prisma = usePrismaClient()
  return await prisma.post.findMany({
    include: {
      author: true,
    },
  })
})
```

### Client-side Usage

```vue
<script setup>
// In client components
const { data: posts } = await $fetch('/api/posts')
</script>
```

## 🚀 Database Setup

The module uses `npx create-db` to automatically create a Prisma Postgres database:

```bash
# The module automatically runs this command
npx create-db@latest --json
```

If `create-db` is not available, it falls back to Docker:

```bash
# Fallback Docker setup
docker run --name nuxt-prisma-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nuxt_prisma \
  -p 5432:5432 \
  -d postgres:15
```

## 🔌 Driver Adapters

### PostgreSQL with pg adapter

```typescript
prisma: {
  useDriverAdapter: true,
  driverAdapter: 'pg',
}
```

### Neon Serverless

```typescript
prisma: {
  useDriverAdapter: true,
  driverAdapter: 'neon',
}
```

### PlanetScale

```typescript
prisma: {
  useDriverAdapter: true,
  driverAdapter: 'planetscale',
}
```

## 🎨 Prisma Studio Integration

Prisma Studio is automatically integrated into Nuxt DevTools:

1. Start your development server: `npm run dev`
2. Open Nuxt DevTools
3. Look for the Prisma tab in the server section
4. Click to open Prisma Studio

## 📝 Example Schema

```prisma
// prisma/schema.prisma
generator client {
  provider   = "prisma-client"
  output     = "./generated/prisma"
  engineType = "client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

## 🚀 Deployment

### NuxtHub Deployment

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@prisma/nuxt'],
  
  prisma: {
    database: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL, // From NuxtHub
    },
    prisma: {
      useDriverAdapter: true,
      driverAdapter: 'pg',
    },
  },
})
```

### Vercel Deployment

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@prisma/nuxt'],
  
  prisma: {
    database: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL,
    },
    prisma: {
      useDriverAdapter: true,
      driverAdapter: 'neon', // Use Neon for Vercel
    },
  },
})
```

## 🔄 Migration from Previous Version

If you're upgrading from the previous version:

1. Update your configuration to use the new structure
2. Remove old Prisma client imports
3. Use the new composables: `usePrismaClient()` and `usePrismaConfig()`
4. Update your schema to use `prisma-client` generator

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [Nuxt Documentation](https://nuxt.com/docs)
- [Rust-Free Prisma Guide](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/no-rust-engine)