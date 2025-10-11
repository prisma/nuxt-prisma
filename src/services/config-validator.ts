import type { PrismaModuleOptions, DatabaseProvider } from "../types";
import consola from "consola";

export class ConfigValidator {
  static validate(options: Partial<PrismaModuleOptions>): PrismaModuleOptions {
    // Apply defaults first
    const withDefaults = this.applyDefaults(options);

    // Then map legacy options
    const validated = this.mapLegacyOptions(withDefaults);

    // Validate provider
    if (validated.provider && !this.isValidProvider(validated.provider)) {
      consola.warn(
        `Invalid database provider: ${validated.provider}. Falling back to sqlite.`,
      );
      validated.provider = "sqlite";
    }

    // Validate studio port
    if (
      validated.studio.port &&
      (validated.studio.port < 1000 || validated.studio.port > 65535)
    ) {
      consola.warn(
        `Invalid studio port: ${validated.studio.port}. Using default 5555.`,
      );
      validated.studio.port = 5555;
    }

    // Validate schema path
    if (validated.schema.path && !validated.schema.path.endsWith(".prisma")) {
      consola.warn("Schema path should end with .prisma extension");
    }

    // Validate client engine type
    if (
      validated.client.engineType &&
      !["library", "binary"].includes(validated.client.engineType)
    ) {
      consola.warn(
        `Invalid engine type: ${validated.client.engineType}. Using library.`,
      );
      validated.client.engineType = "library";
    }

    return validated;
  }

  private static applyDefaults(
    options: Partial<PrismaModuleOptions>,
  ): PrismaModuleOptions {
    return {
      // Core setup defaults
      autoSetup: options.autoSetup ?? true,
      skipPrompts: options.skipPrompts ?? false,

      // Schema management defaults
      schema: {
        write: options.schema?.write ?? true,
        format: options.schema?.format ?? true,
        path: options.schema?.path,
        customContent: options.schema?.customContent,
      },

      // Migration management defaults
      migration: {
        enabled: options.migration?.enabled ?? true,
        autoRun: options.migration?.autoRun ?? false,
        directory: options.migration?.directory,
      },

      // Client generation defaults
      client: {
        generate: options.client?.generate ?? true,
        output: options.client?.output,
        engineType: options.client?.engineType ?? "library",
      },

      // Development tools defaults
      studio: {
        enabled: options.studio?.enabled ?? true,
        port: options.studio?.port ?? 5555,
        browser: options.studio?.browser ?? true,
      },

      // Advanced configuration
      prismaRoot: options.prismaRoot,
      provider: options.provider ?? "sqlite",

      // Performance defaults
      performance: {
        enableMetrics: options.performance?.enableMetrics ?? false,
        enableTracing: options.performance?.enableTracing ?? false,
      },

      // Security defaults
      security: {
        enableLogging: options.security?.enableLogging ?? true,
        enableErrorReporting: options.security?.enableErrorReporting ?? true,
      },

      // Legacy compatibility (preserve if present)
      writeToSchema: options.writeToSchema,
      formatSchema: options.formatSchema,
      runMigration: options.runMigration,
      generateClient: options.generateClient,
      installStudio: options.installStudio,
      autoSetupPrisma: options.autoSetupPrisma,
      prismaSchemaPath: options.prismaSchemaPath,

      // Pass through any other Prisma client options
      ...options,
    };
  }

  /**
   * Map legacy options to new structure for backward compatibility
   */
  private static mapLegacyOptions(
    options: PrismaModuleOptions,
  ): PrismaModuleOptions {
    const mapped = { ...options };

    // Map legacy schema options
    if (options.writeToSchema !== undefined) {
      mapped.schema = { ...mapped.schema, write: options.writeToSchema };
    }
    if (options.formatSchema !== undefined) {
      mapped.schema = { ...mapped.schema, format: options.formatSchema };
    }
    if (options.prismaSchemaPath !== undefined) {
      mapped.schema = { ...mapped.schema, path: options.prismaSchemaPath };
    }

    // Map legacy migration options
    if (options.runMigration !== undefined) {
      mapped.migration = { ...mapped.migration, enabled: options.runMigration };
    }

    // Map legacy client options
    if (options.generateClient !== undefined) {
      mapped.client = { ...mapped.client, generate: options.generateClient };
    }

    // Map legacy studio options
    if (options.installStudio !== undefined) {
      mapped.studio = { ...mapped.studio, enabled: options.installStudio };
    }

    // Map legacy setup options
    if (options.autoSetupPrisma !== undefined) {
      mapped.autoSetup = options.autoSetupPrisma;
    }

    return mapped;
  }

  private static isValidProvider(
    provider: string,
  ): provider is DatabaseProvider {
    const validProviders: DatabaseProvider[] = [
      "sqlite",
      "postgresql",
      "mysql",
      "sqlserver",
      "mongodb",
      "cockroachdb",
    ];
    return validProviders.includes(provider as DatabaseProvider);
  }
}
