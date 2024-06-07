import type { Prisma } from "@prisma/client";

interface ModuleOptions extends Prisma.PrismaClientOptions {
  /**
   * Database connection string to connect to your database.
   * @default process.env.DATABASE_URL //datasource url in your schema.prisma file
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#datasourceurl
   */
  datasourceUrl?: string;

  /**
   * Determines the type and level of logging to the console.
   * @example ['query', 'info', 'warn', 'error']
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#log
   */
  log?: (Prisma.LogLevel | Prisma.LogDefinition)[];

  /**
   * Determines the level of error formatting.
   * @default "colorless"
   * @docs https://prisma.io/docs/reference/api-reference/prisma-client-reference#errorformat
   */
  errorFormat?: Prisma.ErrorFormat;
  installCli: boolean;
  initPrisma: boolean;
  writeToSchema: boolean;
  formatSchema: boolean;
  runMigration: boolean;
  installClient: boolean;
  generateClient: boolean;
  installStudio: boolean;
  skipInstallations: boolean;
  autoSetupPrisma: boolean
}


export type PrismaExtendedModule = ModuleOptions
