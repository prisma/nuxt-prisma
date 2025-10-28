import {
  defineNuxtModule,
  createResolver,
} from "@nuxt/kit";
import { addCustomTab } from "@nuxt/devtools-kit";
import defu from "defu";
import fs from "fs";
import pathe from "pathe";

import {
  checkIfMigrationsFolderExists,
  checkIfPrismaSchemaExists,
  formatSchema,
  initPrisma,
  startPrismaStudio,
  runMigration,
  writeClientInLib,
  generatePrismaClient,
  provisionPrismaDatabase,
} from "./package-utils/setup-helpers";
import { PREDEFINED_LOG_MESSAGES } from "./package-utils/log-helpers";
import { promptUserForPrismaMigrate, promptUserForCreateDb } from "./package-utils/prompts";
import { consola } from "consola";

interface ModuleOptions {
  init?: {
    datasourceProvider?: "postgresql" | "mysql" | "sqlite" | "sqlserver" | "mongodb" | "cockroachdb";
    schemaPath?: string;
    output?: string;
    generatorProvider?: string;
    previewFeatures?: string[];
    url?: string;
  };
  devtools?: {
    enableStudio?: boolean;
    studioPort?: number;
  };
  setup?: {
    autoSetup?: boolean;
    skipPrompts?: boolean;
    generateClient?: boolean;
    runMigration?: boolean;
    formatSchema?: boolean;
    createPrismaPostgres?: boolean;
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
      output: "../generated",
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
      createPrismaPostgres: true,
    },
  },

  async setup(options, nuxt) {
    const { resolve: resolveProject } = createResolver(nuxt.options.rootDir);
    const { resolve: r } = createResolver(import.meta.url);

    const npmLifecycleEvent = process.env?.npm_lifecycle_event;
    const skipAllPrompts = options.setup?.skipPrompts || npmLifecycleEvent === "dev:build";

    const isModuleBuild = nuxt.options.rootDir.endsWith('/nuxt-prisma');
    const forceSkipPrismaSetup =
      process.env?.SKIP_PRISMA_SETUP ||
      (isModuleBuild && !nuxt.options.rootDir.includes('playground'));

    nuxt.options.runtimeConfig.public.prisma = defu(
      nuxt.options.runtimeConfig.public.prisma || {},
      {
        prisma: options.init,
      },
    );

    const prepareModule = () => {
      nuxt.options.experimental.componentIslands ||= {};
      nuxt.options.experimental.componentIslands = true;

      nuxt.options.vite.optimizeDeps = defu(
        nuxt.options.vite.optimizeDeps || {},
        {
          include: ["@prisma/nuxt > @prisma/client"],
        },
      );
    };

    if (forceSkipPrismaSetup || npmLifecycleEvent === "postinstall") {
      if (npmLifecycleEvent !== "postinstall") {
        consola.warn(PREDEFINED_LOG_MESSAGES.PRISMA_SETUP_SKIPPED_WARNING);
      }
      prepareModule();
      return;
    }

    const PROJECT_PATH = resolveProject();
    const PRISMA_SCHEMA_PATH = options.init?.schemaPath || "./prisma/schema.prisma";
    const PRISMA_SCHEMA_CMD = ["--schema", PRISMA_SCHEMA_PATH];
    const FULL_SCHEMA_PATH = resolveProject(PRISMA_SCHEMA_PATH);

    const prismaSchemaExists = checkIfPrismaSchemaExists([FULL_SCHEMA_PATH]);

    const prismaInitWorkflow = async () => {
      if (prismaSchemaExists) return;
      await initPrisma({
        directory: PROJECT_PATH,
        rootDir: PROJECT_PATH,
        datasourceProvider: options.init?.datasourceProvider || "postgresql",
        generatorProvider: options.init?.generatorProvider,
        previewFeatures: options.init?.previewFeatures,
        output: options.init?.output,
        url: options.init?.url,
      });
    };

    const prismaMigrateWorkflow = async () => {
      const migrationFolderExists = checkIfMigrationsFolderExists(
        resolveProject("./prisma/migrations"),
      );
      if (migrationFolderExists || !options.setup?.runMigration) {
        consola.info(PREDEFINED_LOG_MESSAGES.skipMigrations);
        return;
      }
      const migrateAndFormatSchema = async () => {
        await runMigration(PROJECT_PATH, PRISMA_SCHEMA_CMD);
        if (options.setup?.formatSchema) {
          await formatSchema(PROJECT_PATH, PRISMA_SCHEMA_CMD);
        }
      };
      if (options.setup?.autoSetup) {
        await migrateAndFormatSchema();
        return;
      }
      if (skipAllPrompts) return;
      const shouldMigrate = await promptUserForPrismaMigrate(true);
      if (shouldMigrate) {
        await migrateAndFormatSchema();
      }
    };

    const prismaStudioWorkflow = async () => {
      if (!options.devtools?.enableStudio || npmLifecycleEvent !== "dev") {
        consola.info(PREDEFINED_LOG_MESSAGES.skipInstallingPrismaStudio);
        return;
      }
      const studioPort = options.devtools?.studioPort || 5555;
      await startPrismaStudio(
        PROJECT_PATH,
        PRISMA_SCHEMA_CMD,
        studioPort,
      );
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
      consola.info(
        `[Nuxt Prisma] Prisma Studio is available at http://localhost:${studioPort}`,
      );
    };

    const isDatabaseUrlPlaceholder = (url: string): boolean => {
      return url.includes('johndoe:randompassword@localhost') ||
             url.includes('postgresql://johndoe') ||
             url.includes('mysql://johndoe') ||
             url.includes('file:./dev.db');
    };

    const databaseProvisionWorkflow = async () => {
      const { existsSync, readFileSync, writeFileSync } = fs;
      const { join } = pathe;
      const rootEnvPath = join(PROJECT_PATH, ".env");

      let hasRealDatabaseUrl = false;
      if (existsSync(rootEnvPath)) {
        const envContent = readFileSync(rootEnvPath, "utf-8");
        const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
        if (dbUrlMatch && dbUrlMatch[1]) {
          hasRealDatabaseUrl = !isDatabaseUrlPlaceholder(dbUrlMatch[1]);
        }
      }
      if (hasRealDatabaseUrl || options.setup?.createPrismaPostgres === false) {
        return null;
      }
      if (options.setup?.autoSetup && options.setup?.createPrismaPostgres === true) {
        const dbInfo = await provisionPrismaDatabase(PROJECT_PATH);
        if (dbInfo?.connectionString) {
          let envContent = existsSync(rootEnvPath) ? readFileSync(rootEnvPath, "utf-8") : "";
          if (envContent.includes("DATABASE_URL=")) {
            envContent = envContent.replace(
              /DATABASE_URL="[^"]*"/,
              `DATABASE_URL="${dbInfo.connectionString}"`
            );
          } else {
            if (envContent && !envContent.endsWith("\n")) envContent += "\n";
            envContent += `DATABASE_URL="${dbInfo.connectionString}"\n`;
          }
          writeFileSync(rootEnvPath, envContent);
          consola.success("Prisma Postgres database created and configured!");
          consola.info(`Prisma Postgres claim URL: ${dbInfo.claimUrl}`);
        }
        return { shouldPromptMigrate: false, shouldProvision: true };
      }
      if (!skipAllPrompts && !options.setup?.autoSetup) {
        const shouldCreatePrismaPostgres = (options.setup?.createPrismaPostgres ?? true) === true
          ? await promptUserForCreateDb(true)
          : false;
        if (shouldCreatePrismaPostgres) {
          const dbInfo = await provisionPrismaDatabase(PROJECT_PATH);
          if (dbInfo?.connectionString) {
            let envContent = existsSync(rootEnvPath) ? readFileSync(rootEnvPath, "utf-8") : "";
            if (envContent.includes("DATABASE_URL=")) {
              envContent = envContent.replace(
                /DATABASE_URL="[^"]*"/,
                `DATABASE_URL="${dbInfo.connectionString}"`
              );
            } else {
              if (envContent && !envContent.endsWith("\n")) envContent += "\n";
              envContent += `DATABASE_URL="${dbInfo.connectionString}"\n`;
            }
            writeFileSync(rootEnvPath, envContent);
            consola.success("Prisma Postgres database created and configured!");
            consola.info(`Prisma Postgres claim URL: ${dbInfo.claimUrl}`);
          }
        }
        return { provisioned: shouldCreatePrismaPostgres };
      }
      return null;
    };

    await prismaInitWorkflow();
    await databaseProvisionWorkflow();
    await prismaMigrateWorkflow();

    await writeClientInLib(PROJECT_PATH, options.init?.output);

    if (options.setup?.generateClient) {
      await generatePrismaClient(
        PROJECT_PATH,
        PRISMA_SCHEMA_CMD,
      );
    }

    await prismaStudioWorkflow();
    prepareModule();
  },
});
