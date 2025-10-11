import type { Prisma } from "@prisma/client";

export type DatabaseProvider =
  | "sqlite"
  | "postgresql"
  | "mysql"
  | "sqlserver"
  | "mongodb"
  | "cockroachdb";

export interface PrismaModuleOptions
  extends Partial<Prisma.PrismaClientOptions> {
  // Core setup options
  autoSetup: boolean;
  skipPrompts: boolean;

  // Schema management
  schema: {
    write: boolean;
    format: boolean;
    path?: string;
    customContent?: string;
  };

  // Migration management
  migration: {
    enabled: boolean;
    autoRun: boolean;
    directory?: string;
  };

  // Client generation
  client: {
    generate: boolean;
    output?: string;
    engineType?: "library" | "binary";
  };

  // Development tools
  studio: {
    enabled: boolean;
    port?: number;
    browser?: boolean;
  };

  // Advanced configuration
  prismaRoot?: string;
  provider?: DatabaseProvider;

  // Performance
  performance: {
    enableMetrics: boolean;
    enableTracing: boolean;
  };

  // Security
  security: {
    enableLogging: boolean;
    enableErrorReporting: boolean;
  };

  // Legacy compatibility (will be mapped to new structure)
  writeToSchema?: boolean;
  formatSchema?: boolean;
  runMigration?: boolean;
  generateClient?: boolean;
  installStudio?: boolean;
  autoSetupPrisma?: boolean;
  prismaSchemaPath?: string;
}

export interface PrismaSetupContext {
  projectPath: string;
  layerPath: string;
  schemaPath: string;
  migrationsPath: string;
  options: PrismaModuleOptions;
  nuxtOptions: any;
  environment: {
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
    npmLifecycleEvent?: string;
  };
}

export interface PrismaService {
  execute(context: PrismaSetupContext): Promise<void>;
}
