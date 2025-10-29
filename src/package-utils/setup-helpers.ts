import { x } from "tinyexec";
import { PREDEFINED_LOG_MESSAGES } from "./log-helpers";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { consola } from "consola";
import fs from "fs";

type ExecOptions = Parameters<typeof x>[2];

async function detectPackageManager(rootDir: string): Promise<'bun' | 'pnpm' | 'yarn' | 'npm'> {
  const { existsSync } = fs;
  const { join } = await import('pathe');
  if (existsSync(join(rootDir, 'bun.lockb')) || existsSync(join(rootDir, 'bun.lock'))) {
    return 'bun';
  }
  if (existsSync(join(rootDir, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(rootDir, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
}

let cachedPkgManager: string | null = null;

export async function runPkgExec(args: string[], options?: ExecOptions) {
  if (!cachedPkgManager) {
    const cwd = options?.nodeOptions?.cwd || process.cwd();
    const rootDir = typeof cwd === 'string' ? cwd : cwd.toString();
    cachedPkgManager = await detectPackageManager(rootDir);
  }
  switch (cachedPkgManager) {
    case 'bun':
      return x('bunx', args, options);
    case 'pnpm':
      return x('pnpm', ["dlx"].concat(args), options);
    case 'yarn':
      return x('yarn', ["dlx"].concat(args), options);
    default:
      return x('npx', args, options);
  }
}


export type PrismaInitOptions = {
  directory: string;
  rootDir: string;
  datasourceProvider?: "postgresql" | "mysql" | "sqlite" | "sqlserver" | "mongodb" | "cockroachdb";
  generatorProvider?: string;
  previewFeatures?: string[];
  output?: string;
  url?: string;
};

export function checkIfPrismaSchemaExists(paths: string[]) {
  return paths.reduce((prev, current) => {
    return existsSync(current) || prev;
  }, false);
}

export async function initPrisma({
  directory,
  rootDir,
  datasourceProvider = "postgresql",
  generatorProvider,
  previewFeatures,
  output,
  url,
}: PrismaInitOptions) {
  const commandArgs = ["prisma", "init"];
  if (datasourceProvider) {
    commandArgs.push("--datasource-provider");
    commandArgs.push(datasourceProvider);
  }
  if (generatorProvider) {
    commandArgs.push("--generator-provider");
    commandArgs.push(generatorProvider);
  }
  if (Array.isArray(previewFeatures)) {
    for (const feature of previewFeatures) {
      commandArgs.push("--preview-feature");
      commandArgs.push(feature);
    }
  }
  if (output) {
    commandArgs.push("--output");
    commandArgs.push(output);
  }
  if (url) {
    commandArgs.push("--url");
    commandArgs.push(url);
  }
  consola.info(PREDEFINED_LOG_MESSAGES.initPrisma.action);
  const { stderr, exitCode } = await runPkgExec(commandArgs, {
    nodeOptions: {
      cwd: directory,
    },
  });
  if (exitCode !== 0) {
    consola.error(PREDEFINED_LOG_MESSAGES.initPrisma.error, stderr);
    return false;
  }
  
  const { join } = await import('pathe');
  const prismaConfigPath = join(directory, "prisma.config.ts");
  if (existsSync(prismaConfigPath)) {
    try {
      const configContent = readFileSync(prismaConfigPath, "utf-8");
      if (!configContent.includes('import "dotenv/config"')) {
        const updatedContent = `import "dotenv/config";\n${configContent}`;
        writeFileSync(prismaConfigPath, updatedContent);
        consola.info("Added dotenv import to prisma.config.ts");
      }
    } catch (error) {
      consola.warn("Failed to add dotenv import to prisma.config.ts:", error);
    }
  }
  
  consola.success(PREDEFINED_LOG_MESSAGES.initPrisma.success);
  return true;
}

export function checkIfMigrationsFolderExists(path: string) {
  return existsSync(path);
}

export async function runMigration(directory: string, schemaPath: string[]) {
  consola.info(PREDEFINED_LOG_MESSAGES.runMigration.action);
  const cwd = directory;
  const { stderr, exitCode } = await runPkgExec(
    ["prisma", "migrate", "dev", "--name", "init"].concat(schemaPath),
    {
      nodeOptions: {
        cwd,
      },
    },
  );
  
  if (exitCode !== 0) {
    consola.error(PREDEFINED_LOG_MESSAGES.runMigration.error, stderr);
    return false;
  }
  try {
    const { join } = await import('pathe');
    const migrationsDir = join(directory, 'prisma', 'migrations');
    if (!existsSync(migrationsDir)) {
      mkdirSync(migrationsDir, { recursive: true });
    }
  } catch {}
  consola.success(PREDEFINED_LOG_MESSAGES.runMigration.success);
  return true;
}

export async function formatSchema(directory: string, schemaPath: string[]) {
  consola.info(PREDEFINED_LOG_MESSAGES.formatSchema.action);
  const cwd = directory;
  const { stderr, exitCode } = await runPkgExec(
    ["prisma", "format"].concat(schemaPath),
    {
      nodeOptions: {
        cwd,
      },
    },
  );
  if (exitCode !== 0) {
    consola.error(PREDEFINED_LOG_MESSAGES.formatSchema.error, stderr);
    return;
  }
  consola.success(PREDEFINED_LOG_MESSAGES.formatSchema.success);
}

export async function generatePrismaClient(
  directory: string,
  prismaSchemaPath: string[],
  verboseLog: boolean = false,
) {
  consola.info(PREDEFINED_LOG_MESSAGES.generatePrismaClient.action);
  const cwd = directory;
  const { stderr, exitCode } = await runPkgExec(
    ["prisma", "generate"].concat(prismaSchemaPath),
    {
      nodeOptions: {
        cwd,
      },
    },
  );
  if (exitCode !== 0) {
    consola.error(PREDEFINED_LOG_MESSAGES.generatePrismaClient.error);
    if (verboseLog) {
      consola.error(stderr);
    }
    return;
  }
  consola.success(PREDEFINED_LOG_MESSAGES.generatePrismaClient.success);
}

export async function startPrismaStudio(
  directory: string,
  schemaLocation: string[],
  port?: number,
) {
  consola.info(PREDEFINED_LOG_MESSAGES.startPrismaStudio.action);
  try {
    const args = ["prisma", "studio", "--browser", "none"]
      .concat(port ? ["--port", String(port)] : [])
      .concat(schemaLocation);

    // Fire-and-forget: do not await the long-running Studio process
    const proc: any = runPkgExec(args, {
      nodeOptions: {
        cwd: directory,
      },
      throwOnError: false,
    });
    // Detach so Nuxt setup isn't blocked
    proc?.process?.unref?.();

    consola.success(PREDEFINED_LOG_MESSAGES.startPrismaStudio.success);
    consola.info(PREDEFINED_LOG_MESSAGES.startPrismaStudio.info);
    return true;
  } catch (err) {
    consola.error(PREDEFINED_LOG_MESSAGES.startPrismaStudio.error);
  }
}

export async function writeClientInLib(path: string, clientImportPath?: string) {
  const serverUtilsDir = `${path}/server/utils`;
  const utilPath = `${serverUtilsDir}/prisma.ts`;
  try {
    const importPath = `${clientImportPath}/client`
    const fileContent = `import { PrismaClient } from '../${importPath}'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export function usePrisma(): PrismaClient {
  if (import.meta.client) {
    throw new Error('usePrisma() is server-only. Call it in server code or server routes.')
  }
  return prisma
}
`;

    if (!existsSync(serverUtilsDir)) {
      mkdirSync(serverUtilsDir, { recursive: true });
    }
    writeFileSync(utilPath, fileContent);
    consola.success("Created server util: server/utils/prisma.ts");
  } catch (err) {
    consola.error("Failed to write Prisma server util:", err);
  }
}

export async function provisionPrismaDatabase(rootDir: string) {
  consola.info("Running create-db to create a Prisma Postgres database...");
  try {
    const { stdout, stderr, exitCode } = await runPkgExec(["create-db@latest", "--json"], {
      nodeOptions: { cwd: rootDir },
    });
    if (exitCode !== 0) {
      consola.error("create-db failed to create database:", stderr);
      return null;
    }
    const dbInfo = JSON.parse(stdout);
    consola.success("Database created successfully via create-db!");
    return {
      connectionString: dbInfo.connectionString,
      directConnectionString: dbInfo.directConnectionString,
      claimUrl: dbInfo.claimUrl,
      deletionDate: dbInfo.deletionDate,
      region: dbInfo.region,
      name: dbInfo.name,
      projectId: dbInfo.projectId,
    };
  } catch (error) {
    consola.error("create-db error while creating database:", error);
    return null;
  }
}
