import {
  defineNuxtModule,
  createResolver,
  addServerImportsDir,
} from "@nuxt/kit";
import { addCustomTab } from "@nuxt/devtools-kit";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { consola } from "consola";

import {
  initPrisma,
  formatSchema,
  startPrismaStudio,
  generatePrismaClient,
} from "./package-utils/setup-helpers";

export type DatasourceProvider =
  | "postgresql"
  | "mysql"
  | "sqlite"
  | "sqlserver"
  | "cockroachdb";

interface ModuleOptions {
  init?: {
    datasourceProvider?: DatasourceProvider;
    schemaPath?: string;
    output?: string;
    generatorProvider?: string;
    previewFeatures?: string[];
    url?: string;
    db?: boolean;
    /** Adds example User model to the created schema file via --with-model flag */
    withModel?: boolean;
  };
  /** Prisma Studio options */
  studio?: {
    /** Enable Prisma Studio in devtools (default: true) */
    enabled?: boolean;
    /** Port for Prisma Studio (default: 5555) */
    port?: number;
  };
}

export type PrismaNuxtModule = ModuleOptions;

export default defineNuxtModule<PrismaNuxtModule>({
  meta: {
    name: "@prisma/nuxt",
    configKey: "prisma",
    compatibility: {
      nuxt: ">=3.0.0",
    },
  },
  defaults: {
    init: {
      datasourceProvider: "postgresql",
      schemaPath: "./prisma/schema.prisma",
      output: "../generated/prisma",
      generatorProvider: "prisma-client",
      db: false,
      withModel: false,
    },
    studio: {
      enabled: true,
      port: 5555,
    },
  },

  async setup(options, nuxt) {
    const { resolve: resolveProject } = createResolver(nuxt.options.rootDir);
    const npmLifecycleEvent = process.env?.npm_lifecycle_event;

    // Skip during postinstall or when SKIP_PRISMA_SETUP is set
    const isModuleBuild = nuxt.options.rootDir.endsWith("/nuxt-prisma");
    const shouldSkip =
      process.env?.SKIP_PRISMA_SETUP ||
      npmLifecycleEvent === "postinstall" ||
      (isModuleBuild && !nuxt.options.rootDir.includes("playground"));

    if (shouldSkip) {
      return;
    }

    const PROJECT_PATH = resolveProject();
    const PRISMA_SCHEMA_PATH = options.init?.schemaPath || "./prisma/schema.prisma";
    const FULL_SCHEMA_PATH = resolveProject(PRISMA_SCHEMA_PATH);
    const prismaSchemaExists = existsSync(FULL_SCHEMA_PATH);

    const datasourceProvider = options.init?.datasourceProvider || "postgresql";
    const usePrismaPostgres = options.init?.db === true;
    const outputPath = options.init?.output || "../generated/prisma";

    // 1. Initialize Prisma if schema doesn't exist
    if (!prismaSchemaExists) {
      await initPrisma({
        directory: PROJECT_PATH,
        datasourceProvider: usePrismaPostgres ? undefined : datasourceProvider,
        generatorProvider: options.init?.generatorProvider || "prisma-client",
        previewFeatures: options.init?.previewFeatures,
        output: outputPath,
        url: options.init?.url,
        db: usePrismaPostgres,
        withModel: options.init?.withModel,
      });
    }

    // 2. Format Prisma schema
    const schemaCmd = ["--schema", PRISMA_SCHEMA_PATH];
    await formatSchema(PROJECT_PATH, schemaCmd);

    // 3. Generate Prisma Client (only if not already generated)
    const generatedPath = resolveProject(outputPath);
    if (!existsSync(generatedPath)) {
      await generatePrismaClient(PROJECT_PATH, schemaCmd);
    }

    // 4. Create server/utils/prisma.ts (only for PostgreSQL)
    if (usePrismaPostgres || datasourceProvider === "postgresql") {
      const adapterPkg = usePrismaPostgres ? "@prisma/adapter-ppg" : "@prisma/adapter-pg";
      const adapterClass = usePrismaPostgres ? "PrismaPostgresAdapter" : "PrismaPg";
      
      writePrismaUtil(PROJECT_PATH, outputPath, adapterPkg, adapterClass);
      
      consola.box(`[Prisma] Install required packages:\nbun add prisma @prisma/client ${adapterPkg}`);
    }

    // 5. Register server utils for auto-imports
    addServerImportsDir(resolveProject("server/utils"));

    // 6. Start Prisma Studio (only in dev mode)
    if (options.studio?.enabled && npmLifecycleEvent === "dev") {
      const studioPort = options.studio?.port || 5555;
      await startPrismaStudio(PROJECT_PATH, schemaCmd, studioPort);

      addCustomTab({
        name: "nuxt-prisma",
        title: "Prisma Studio",
        icon: "simple-icons:prisma",
        category: "server",
        view: {
          type: "iframe",
          src: `http://localhost:${studioPort}/`,
          persistent: true,
        },
      });

      consola.info(`[Nuxt Prisma] Studio available at http://localhost:${studioPort}`);
    }
  },
});

function writePrismaUtil(
  projectPath: string,
  outputPath: string,
  adapterPkg: string,
  adapterClass: string
) {
  const serverUtilsDir = `${projectPath}/server/utils`;
  const utilPath = `${serverUtilsDir}/prisma.ts`;

  // Skip if file already exists
  if (existsSync(utilPath)) {
    consola.info("[Prisma] server/utils/prisma.ts already exists, skipping");
    return;
  }

  // Path from server/utils to generated prisma client
  const clientImportPath = `../../${outputPath.replace(/^\.\.\//, "")}`;

  const fileContent = `import { ${adapterClass} } from '${adapterPkg}'
import { PrismaClient } from '${clientImportPath}/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const adapter = new ${adapterClass}({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export function usePrisma() {
  return prisma
}
`;

  try {
    if (!existsSync(serverUtilsDir)) {
      mkdirSync(serverUtilsDir, { recursive: true });
    }
    writeFileSync(utilPath, fileContent);
    consola.success("[Prisma] Created server/utils/prisma.ts");
  } catch (err) {
    consola.error("[Prisma] Failed to create server/utils/prisma.ts", err);
  }
}
