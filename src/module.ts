import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addImportsDir,
  addServerImportsDir,
} from "@nuxt/kit";
import { fileURLToPath } from "url";
import defu from "defu";
import consola from "consola";

// New modular architecture
import type { PrismaModuleOptions, PrismaSetupContext } from "./types";
import { ConfigValidator } from "./services/config-validator";
import { EnvironmentDetector } from "./utils/environment-detector";
import { PrismaOrchestrator } from "./services/prisma-orchestrator";
import { PREDEFINED_LOG_MESSAGES } from "./package-utils/log-helpers";

// Legacy type for backward compatibility - extends new options
interface ModuleOptions extends PrismaModuleOptions {
  // All options are now in PrismaModuleOptions
}

export type PrismaExtendedModule = ModuleOptions;

// Helper functions for module setup
async function createSetupContext(
  options: PrismaModuleOptions,
  nuxt: any,
): Promise<PrismaSetupContext> {
  const { resolve: resolveProject } = createResolver(nuxt.options.rootDir);
  const projectPath = resolveProject();
  const layerPath = options.prismaRoot
    ? resolveProject(options.prismaRoot)
    : projectPath;

  // Resolve schema path relative to project root if it's a relative path
  const schemaPath = options.schema.path
    ? options.schema.path.startsWith("./") ||
      options.schema.path.startsWith("../")
      ? resolveProject(options.schema.path)
      : options.schema.path
    : `${layerPath}/prisma/schema.prisma`;

  return {
    projectPath,
    layerPath,
    schemaPath,
    migrationsPath:
      options.migration.directory || `${layerPath}/prisma/migrations`,
    options,
    nuxtOptions: nuxt.options,
    environment: {
      ...EnvironmentDetector.detectEnvironment(),
      isTest: !!EnvironmentDetector.detectEnvironment().isTest,
    },
  };
}

function prepareModule(context: PrismaSetupContext): void {
  const { resolve: resolver } = createResolver(import.meta.url);
  const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));

  // Register plugin and runtime utilities
  addPlugin(resolver("./runtime/plugin"));
  addImportsDir(resolver(runtimeDir, "composables"));
  addServerImportsDir(resolver(runtimeDir, "utils"));

  // Configure Vite optimizations
  configureViteOptimizations(context);

  // Configure runtime config
  configureRuntimeConfig(context);
}

function configureViteOptimizations(context: PrismaSetupContext): void {
  const { nuxtOptions } = context;

  // Enhanced Vite configuration for Prisma
  nuxtOptions.vite.optimizeDeps = defu(nuxtOptions.vite.optimizeDeps || {}, {
    include: ["@prisma/client"],
    exclude: ["@prisma/engines", ".prisma/client"],
  });

  // Configure build for better Prisma support
  nuxtOptions.vite.build = defu(nuxtOptions.vite.build || {}, {
    rollupOptions: {
      external: [".prisma/client/index-browser"],
    },
  });

  // Fix for Prisma client resolution issues
  nuxtOptions.vite.resolve = defu(nuxtOptions.vite.resolve || {}, {
    alias: {
      ".prisma/client/index-browser": "@prisma/client/index-browser",
      ".prisma/client": "@prisma/client",
      ".prisma": "@prisma/client",
    },
  });

  // Configure global definitions for Prisma
  nuxtOptions.vite.define = defu(nuxtOptions.vite.define || {}, {
    global: "globalThis",
  });

  // Configure server-side rendering for Prisma
  nuxtOptions.ssr = nuxtOptions.ssr ?? true;

  // Nitro configuration for Prisma
  nuxtOptions.nitro = defu(nuxtOptions.nitro || {}, {
    experimental: {
      wasm: true,
    },
    rollupConfig: {
      external: [".prisma/client", "@prisma/engines", "@prisma/client"],
      output: {
        externalLiveBindings: false,
      },
    },
  });
}

function configureRuntimeConfig(context: PrismaSetupContext): void {
  const { options, nuxtOptions } = context;

  nuxtOptions.runtimeConfig.public.prisma = defu(
    nuxtOptions.runtimeConfig.public.prisma || {},
    {
      log: options.log,
      errorFormat: options.errorFormat,
      performance: options.performance,
    },
  );
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@prisma/nuxt",
    configKey: "prisma",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
  },

  // Module default values with new structure
  defaults: {
    // Core setup options
    autoSetup: false,
    skipPrompts: false,

    // Schema management
    schema: {
      write: true,
      format: true,
      path: undefined,
      customContent: undefined,
    },

    // Migration management
    migration: {
      enabled: true,
      autoRun: false,
      directory: undefined,
    },

    // Client generation
    client: {
      generate: true,
      output: undefined,
      engineType: "library" as const,
    },

    // Development tools
    studio: {
      enabled: true,
      port: 5555,
      browser: false,
    },

    // Advanced configuration
    provider: "sqlite" as const,
    prismaRoot: undefined,

    // Performance
    performance: {
      enableMetrics: false,
      enableTracing: false,
    },

    // Security
    security: {
      enableLogging: true,
      enableErrorReporting: true,
    },

    // Prisma client options (legacy structure maintained)
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: [],
    errorFormat: "pretty" as const,

    // Legacy options for backward compatibility
    writeToSchema: true,
    formatSchema: true,
    runMigration: true,
    generateClient: true,
    installStudio: true,
    autoSetupPrisma: false,
    prismaSchemaPath: undefined,
  },

  async setup(options, nuxt) {
    try {
      // Validate and normalize options (includes legacy mapping)
      const validatedOptions = ConfigValidator.validate(options);

      // Setup context
      const context = await createSetupContext(validatedOptions, nuxt);

      // Check if setup should be skipped
      if (EnvironmentDetector.shouldSkipPrismaSetup(validatedOptions)) {
        consola.info("Prisma setup skipped");
        if (context.environment.npmLifecycleEvent !== "postinstall") {
          consola.warn(PREDEFINED_LOG_MESSAGES.PRISMA_SETUP_SKIPPED_WARNING);
        }
        prepareModule(context);
        return;
      }

      // Execute setup workflow using orchestrator
      const orchestrator = new PrismaOrchestrator();
      await orchestrator.executeSetup(context);

      // Prepare module integration
      prepareModule(context);
    } catch (error) {
      consola.error("Failed to setup Prisma module:", error);
      if (options.security?.enableErrorReporting !== false) {
        throw error;
      }
    }
  },
});
