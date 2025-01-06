import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  addServerImportsDir,
} from "@nuxt/kit";
import { fileURLToPath } from "url";
import defu from "defu";

// Import utility functions
import {
  getMigrationsFolder,
  getPrismaSchema,
  formatSchema,
  initPrisma,
  installStudio,
  runMigration,
  writeClientInLib,
  writeToSchema,
  generatePrismaClient,
} from "./package-utils/setup-helpers";
import { log, PREDEFINED_LOG_MESSAGES } from "./package-utils/log-helpers";
import type { Prisma } from "@prisma/client";
import { executeRequiredPrompts } from "./package-utils/prompts";
import { ensureDependencyInstalled } from "nypm";

// Module configuration interface
interface ModuleOptions extends Prisma.PrismaClientOptions {
  writeToSchema: boolean;
  formatSchema: boolean;
  runMigration: boolean;
  installClient: boolean;
  installCLI: boolean;
  generateClient: boolean;
  installStudio: boolean;
  autoSetupPrisma: boolean;
  skipPrompts: boolean;
  prismaRoot?: string;
  prismaSchemaPath?: string;
}

export type PrismaExtendedModule = ModuleOptions;

export default defineNuxtModule<PrismaExtendedModule>({
  meta: {
    name: "@prisma/nuxt",
    configKey: "prisma",
  },

  // Default configuration options for the module
  defaults: {
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // Security: Ensure DATABASE_URL is correctly set and secure
      },
    },
    log: [],
    errorFormat: "pretty",
    writeToSchema: true,
    formatSchema: true,
    runMigration: true,
    installClient: true,
    installCLI: true,
    generateClient: true,
    installStudio: true,
    autoSetupPrisma: false,
    skipPrompts: false,
    prismaRoot: undefined,
    prismaSchemaPath: undefined,
  },

  async setup(options, nuxt) {
    const { resolve: resolveProject } = createResolver(nuxt.options.rootDir);
    const { resolve: resolver } = createResolver(import.meta.url);
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));

    const npmLifecycleEvent = process.env?.npm_lifecycle_event;
    const skipAllPrompts =
      options.skipPrompts || npmLifecycleEvent === "dev:build";

    /**
     * Helper function to prepare the module configuration
     */
    const prepareModule = () => {
      // Enable server components for Nuxt
      nuxt.options.experimental.componentIslands ||= {};
      nuxt.options.experimental.componentIslands = true;

      // Add plugins and import directories
      addPlugin(resolver("./runtime/plugin"));
      addImportsDir(resolver(runtimeDir, "composables"));
      addServerImportsDir(resolver(runtimeDir, "utils"));
      // addServerImportsDir(resolver(runtimeDir, "server/utils"));

      // Optimize dependencies for Vite
      nuxt.options.vite.optimizeDeps = defu(
        nuxt.options.vite.optimizeDeps || {},
        {
          include: ["@prisma/nuxt > @prisma/client"],
        },
      );
    };

    // Skip Prisma setup logic if flagged
    const forceSkipPrismaSetup =
      import.meta.env?.SKIP_PRISMA_SETUP ??
      process.env?.SKIP_PRISMA_SETUP ??
      false;

    // Expose module options to the runtime configuration
    nuxt.options.runtimeConfig.public.prisma = defu(
      nuxt.options.runtimeConfig.public.prisma || {},
      {
        log: options.log,
        errorFormat: options.errorFormat,
      },
    );

    if (forceSkipPrismaSetup || npmLifecycleEvent === "postinstall") {
      if (npmLifecycleEvent !== "postinstall") {
        log(PREDEFINED_LOG_MESSAGES.PRISMA_SETUP_SKIPPED_WARNING);
      }
      prepareModule();
      return;
    }

    const PROJECT_PATH = resolveProject();

    // Concatenate PROJECT_PATH and prismaRoot manually
    const LAYER_PATH = options.prismaRoot
      ? resolveProject(options.prismaRoot) // Combines paths safely
      : PROJECT_PATH;

    // Check if the Prisma schema exists
    const resolvedPrismaSchema = getPrismaSchema([
      resolveProject(LAYER_PATH, "schema.prisma"),
      resolveProject(LAYER_PATH, "prisma", "schema.prisma"),
      resolveProject(LAYER_PATH, "prisma", "schema"),
    ]);

    const PRISMA_SCHEMA_CMD = [
      "--schema",
      options.prismaSchemaPath || resolvedPrismaSchema,
    ];

    // Ensure Prisma CLI is installed if required
    if (options.installCLI) {
      log(PREDEFINED_LOG_MESSAGES.installPrismaCLI.action);

      try {
        await ensureDependencyInstalled("prisma", {
          cwd: PROJECT_PATH,
          dev: true
        });
        log(PREDEFINED_LOG_MESSAGES.installPrismaCLI.success);
      } catch (error) {
        log(PREDEFINED_LOG_MESSAGES.installPrismaCLI.error);
      }
      await generatePrismaClient(
        PROJECT_PATH,
        PRISMA_SCHEMA_CMD,
        options.log?.includes("error"),
      );
    }

    /**
     * Handle Prisma migrations workflow
     */
    const prismaMigrateWorkflow = async () => {
      const migrationFolder = getMigrationsFolder([
        resolveProject(LAYER_PATH, "migrations"),
        resolveProject(LAYER_PATH, "prisma", "migrations"),
      ]);

      if (migrationFolder || !options.runMigration) {
        log(PREDEFINED_LOG_MESSAGES.skipMigrations);
        return;
      }

      const migrateAndFormatSchema = async () => {
        await runMigration(PROJECT_PATH, PRISMA_SCHEMA_CMD);
        if (options.formatSchema) {
          await formatSchema(PROJECT_PATH, PRISMA_SCHEMA_CMD);
        }
      };

      if (options.autoSetupPrisma && options.runMigration) {
        await migrateAndFormatSchema();
        return;
      }

      const promptResult = await executeRequiredPrompts({
        promptForMigrate: true && !skipAllPrompts,
        promptForPrismaStudio: false && !skipAllPrompts,
      });

      if (promptResult?.promptForPrismaMigrate && options.runMigration) {
        await migrateAndFormatSchema();
      }
    };

    /**
     * Handle Prisma initialization workflow
     */
    const prismaInitWorkflow = async () => {
      await initPrisma({
        directory: LAYER_PATH,
        rootDir: PROJECT_PATH,
        provider: "sqlite",
      });
      await writeToSchema(resolvedPrismaSchema);
    };

    /**
     * Handle Prisma Studio setup workflow
     */
    const prismaStudioWorkflow = async () => {
      if (!options.installStudio || npmLifecycleEvent !== "dev") {
        log(PREDEFINED_LOG_MESSAGES.skipInstallingPrismaStudio);
        return;
      }

      const installAndStartPrismaStudio = async () => {
        await installStudio(PROJECT_PATH, PRISMA_SCHEMA_CMD);

        nuxt.hooks.hook("devtools:customTabs", (tab) => {
          tab.push({
            name: "nuxt-prisma",
            title: "Prisma Studio",
            icon: "simple-icons:prisma",
            category: "server",
            view: {
              type: "iframe",
              src: "http://localhost:5555/",
              persistent: true,
            },
          });
        });
      };

      await installAndStartPrismaStudio();
    };

    // Execute workflows sequentially
    if (!resolvedPrismaSchema) {
      await prismaInitWorkflow();
    }
    await prismaMigrateWorkflow();
    await writeClientInLib(LAYER_PATH);

    if (options.generateClient) {
      if (options.installClient) {
        await ensureDependencyInstalled("@prisma/client", {
          cwd: PROJECT_PATH
        });
      }
      await generatePrismaClient(
        PROJECT_PATH,
        PRISMA_SCHEMA_CMD,
        options.log?.includes("error"),
      );
    }

    await prismaStudioWorkflow();
    prepareModule();
  },
});
