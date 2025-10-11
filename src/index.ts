// Export all types for external use
export type {
  PrismaModuleOptions,
  PrismaSetupContext,
  PrismaService,
  DatabaseProvider,
} from "./types";

// Export services for advanced usage
export { ConfigValidator } from "./services/config-validator";
export { EnvironmentDetector } from "./utils/environment-detector";
export { SchemaService } from "./services/schema-service";
export { MigrationService } from "./services/migration-service";
export { ClientService } from "./services/client-service";
export { StudioService } from "./services/studio-service";
export { PrismaOrchestrator } from "./services/prisma-orchestrator";

// Export main module (default export)
export { default } from "./module";
