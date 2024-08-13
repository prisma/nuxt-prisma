import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  addServerImportsDir,
} from "@nuxt/kit";
import { fileURLToPath } from "url";
import defu from "defu";
import { executeRequiredPrompts } from "./package-utils/prompts";
import {
  checkIfMigrationsFolderExists,
  checkIfPrismaSchemaExists,
  formatSchema,
  generateClient,
  initPrisma,
  installPrismaCLI,
  installStudio,
  isPrismaCLIInstalled,
  runMigration,
  writeClientInLib,
  writeToSchema,
} from "./package-utils/setup-helpers";
import { log, PREDEFINED_LOG_MESSAGES } from "./package-utils/log-helpers";
import type { Prisma } from "@prisma/client";
import type { PackageManager } from "./package-utils/detect-pm";
import getProjectRoot from "./package-utils/get-project-root";

interface ModuleOptions extends Prisma.PrismaClientOptions {
  writeToSchema: boolean;
  formatSchema: boolean;
  runMigration: boolean;
  installClient: boolean;
  installCLI: boolean;
  generateClient: boolean;
  installStudio: boolean;
  autoSetupPrisma: boolean;
  packageManager?: PackageManager;
  prismaRoot?: string;
}

export type PrismaExtendedModule = ModuleOptions;

export default defineNuxtModule<PrismaExtendedModule>({
  meta: {
    name: "@prisma/nuxt",
    configKey: "prisma",
  },
  // Default configuration options of the Nuxt module
  defaults: {
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
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
    packageManager: undefined,
    prismaRoot: undefined,
  },

  async setup(options, nuxt) {
    const { resolve: resolveProject } = createResolver(nuxt.options.rootDir);
    const { resolve: resolver } = createResolver(import.meta.url);
    const { resolve: resolveRoot } = createResolver(getProjectRoot());
    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));

    // Identifies which script is running: posinstall, dev or prod
    const npm_lifecycle_event = process.env?.npm_lifecycle_event;

    const prepareModule = () => {
      // Enable server components for Nuxt
      nuxt.options.experimental.componentIslands ||= {};
      nuxt.options.experimental.componentIslands = true;

      // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`

      addPlugin(resolver("./runtime/plugin"));
      addImportsDir(resolver(runtimeDir, "composables"));

      // Auto-import from runtime/server/utils
      addServerImportsDir(resolver(runtimeDir, "utils"));

      nuxt.options.vite.optimizeDeps ||= {};
      nuxt.options.vite.optimizeDeps = {
        include: ["@prisma/nuxt > @prisma/client"],
      };
    };

    const force_skip_prisma_setup =
      import.meta.env?.SKIP_PRISMA_SETUP ??
      process.env?.SKIP_PRISMA_SETUP ??
      false;

    // exposing module options to application runtime
    nuxt.options.runtimeConfig.public.prisma = defu(
      nuxt.options.runtimeConfig.public.prisma || {},
      {
        log: options.log,
        errorFormat: options.errorFormat,
      },
    );

    if (force_skip_prisma_setup || npm_lifecycle_event === "postinstall") {
      if (npm_lifecycle_event !== "postinstall") {
        log(PREDEFINED_LOG_MESSAGES.PRISMA_SETUP_SKIPPED_WARNING);
      }
      prepareModule();
      return;
    }

    let projectPath = resolveProject();
    if (options.prismaRoot?.length)
      projectPath = resolveRoot(options.prismaRoot);

    const PROJECT_PATH = projectPath;

    if (options.installCLI) {
      // Check if Prisma CLI is installed.
      const prismaInstalled = await isPrismaCLIInstalled(PROJECT_PATH);

      // if Prisma CLI is installed skip the following step.
      if (!prismaInstalled) {
        await installPrismaCLI(PROJECT_PATH, options.packageManager);
      }
    }

    // Check if Prisma Schema exists
    const prismaSchemaExists = checkIfPrismaSchemaExists([
      resolveProject("prisma", "schema.prisma"),
      resolveProject("prisma", "schema"),
    ]);

    const prismaMigrateWorkflow = async () => {
      // Check if Prisma migrations folder exists
      const doesMigrationFolderExist = checkIfMigrationsFolderExists(
        resolveProject("prisma", "migrations"),
      );

      if (doesMigrationFolderExist || !options.runMigration) {
        // Skip migration as the migration folder exists
        log(PREDEFINED_LOG_MESSAGES.skipMigrations);
        return;
      }

      const migrateAndFormatSchema = async () => {
        await runMigration(PROJECT_PATH);

        if (!options.formatSchema) {
          return;
        }

        await formatSchema(PROJECT_PATH);
      };

      if (options.autoSetupPrisma && options.runMigration) {
        await migrateAndFormatSchema();
        return;
      }

      const promptResult = await executeRequiredPrompts({
        promptForMigrate: true,
        promptForPrismaStudio: false,
      });

      if (promptResult?.promptForPrismaMigrate && options.runMigration) {
        await migrateAndFormatSchema();
      }

      return;
    };

    const prismaInitWorkflow = async () => {
      await initPrisma({
        directory: PROJECT_PATH,
        provider: "sqlite",
      });

      // Add dummy models to the Prisma schema
      await writeToSchema(`${PROJECT_PATH}/prisma/schema.prisma`);
    };

    const prismaStudioWorkflow = async () => {
      if (!options.installStudio || npm_lifecycle_event !== "dev") {
        log(PREDEFINED_LOG_MESSAGES.skipInstallingPrismaStudio);
        return;
      }

      const installAndStartPrismaStudio = async () => {
        await installStudio(PROJECT_PATH);
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

      if (options.autoSetupPrisma) {
        await installAndStartPrismaStudio();
        return;
      }

      const promptResults = await executeRequiredPrompts({
        promptForMigrate: false,
        promptForPrismaStudio: true,
      });

      if (promptResults?.promptForInstallingStudio) {
        await installAndStartPrismaStudio();
      }
    };

    if (!prismaSchemaExists) {
      await prismaInitWorkflow();
    }

    await prismaMigrateWorkflow();
    await writeClientInLib(PROJECT_PATH);

    if (options.generateClient) {
      await generateClient(
        PROJECT_PATH,
        options.installClient,
        options.packageManager,
      );
    }

    await prismaStudioWorkflow();

    prepareModule();
    return;
  },
});
