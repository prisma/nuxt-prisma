import { execa } from "execa";
import {
  installingPrismaClientWithPM,
  installingPrismaCLIWithPM,
} from "./detect-pm";
import {
  log,
  logError,
  logSuccess,
  PREDEFINED_LOG_MESSAGES,
} from "./log-helpers";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

export type DatabaseProviderType =
  | "sqlite"
  | "postgresql"
  | "mysql"
  | "sqlserver"
  | "mongodb"
  | "cockroachdb";

export type PrismaInitOptions = {
  directory: string;
  datasourceUrl?: string;
  provider: DatabaseProviderType;
};

export async function isPrismaCLIInstalled(
  directory: string,
): Promise<boolean> {
  try {
    await execa("npx", ["prisma", "version"], { cwd: directory });
    logSuccess(PREDEFINED_LOG_MESSAGES.isPrismaCLIinstalled.yes);
    return true;
  } catch (error) {
    logError(PREDEFINED_LOG_MESSAGES.isPrismaCLIinstalled.no);
    // log(error);
    return false;
  }
}

export async function installPrismaCLI(directory: string) {
  try {
    const installCmd = installingPrismaCLIWithPM();

    await execa(installCmd.pm, installCmd.command, {
      cwd: directory,
    });
    logSuccess(PREDEFINED_LOG_MESSAGES.installPrismaCLI.yes);
  } catch (err) {
    logError(PREDEFINED_LOG_MESSAGES.installPrismaCLI.no);
    log(err);
  }
}

export function checkIfPrismaSchemaExists(paths: string[]) {
  const exists = paths.reduce((prev, current) => {
    return existsSync(current) || prev;
  }, false);

  if (exists) {
    logSuccess(PREDEFINED_LOG_MESSAGES.checkIfPrismaSchemaExists.yes);
    return true;
  }

  logError(PREDEFINED_LOG_MESSAGES.checkIfPrismaSchemaExists.no);
  return false;
}

export async function initPrisma({
  directory,
  provider = "sqlite",
  datasourceUrl,
}: PrismaInitOptions) {
  const command = ["npx", "prisma", "init", "--datasource-provider"];

  command.push(provider);

  if (datasourceUrl) {
    command.push("--url");
    command.push(datasourceUrl);
  }

  try {
    log(PREDEFINED_LOG_MESSAGES.initPrisma.action);

    const { stdout: initializePrisma } = await execa("npx", command, {
      cwd: directory,
    });

    log(initializePrisma?.split("Next steps")?.[0]);

    return true;
  } catch (err) {
    logError(PREDEFINED_LOG_MESSAGES.initPrisma.error);
    log(err);

    return false;
  }
}

export function checkIfMigrationsFolderExists(path: string) {
  if (existsSync(path)) {
    logSuccess(PREDEFINED_LOG_MESSAGES.checkIfMigrationsFolderExists.success);
    return true;
  }

  logError(PREDEFINED_LOG_MESSAGES.checkIfMigrationsFolderExists.error);
  return false;
}

export async function writeToSchema(prismaSchemaPath: string) {
  try {
    let existingSchema = "";

    try {
      existingSchema = readFileSync(prismaSchemaPath, "utf-8");
    } catch {
      logError(PREDEFINED_LOG_MESSAGES.writeToSchema.errorReadingFile);
      return false;
    }

    const addModel = `
            model User {
              id    Int     @id @default(autoincrement())
              email String  @unique
              name  String?
              posts Post[]
            }

            model Post {
              id        Int     @id @default(autoincrement())
              title     String
              content   String?
              published Boolean @default(false)
              author    User    @relation(fields: [authorId], references: [id])
              authorId  Int
            }
          `;

    const updatedSchema = `${existingSchema.trim()}\n\n${addModel}`;
    writeFileSync(prismaSchemaPath, updatedSchema);
  } catch {
    logError(PREDEFINED_LOG_MESSAGES.writeToSchema.failedToWrite);
  }
}

export async function runMigration(directory: string) {
  try {
    log(PREDEFINED_LOG_MESSAGES.runMigration.action);

    await execa("npx", ["prisma", "migrate", "dev", "--name", "init"], {
      cwd: directory,
    });
    logSuccess(PREDEFINED_LOG_MESSAGES.runMigration.success);
    return true;
  } catch (err) {
    logError(PREDEFINED_LOG_MESSAGES.runMigration.error);
    log(err);
    log(PREDEFINED_LOG_MESSAGES.suggestions.migrate);
    return false;
  }
}

export async function formatSchema(directory: string) {
  try {
    log(PREDEFINED_LOG_MESSAGES.formatSchema.action);
    await execa("npx", ["prisma", "format"], { cwd: directory });
  } catch {
    logError(PREDEFINED_LOG_MESSAGES.formatSchema.error);
  }
}

export async function generateClient(
  directory: string,
  installPrismaClient: boolean = true,
) {
  log(PREDEFINED_LOG_MESSAGES.generatePrismaClient.action);

  if (installPrismaClient) {
    try {
      const installCmd = installingPrismaClientWithPM();

      await execa(installCmd.pm, installCmd.command, {
        cwd: directory,
      });
    } catch (error) {
      logError(
        PREDEFINED_LOG_MESSAGES.generatePrismaClient
          .prismaClientInstallationError,
      );
      // log(error);
    }
  }

  try {
    const { stdout: generateClient } = await execa(
      "npx",
      ["prisma", "generate"],
      { cwd: directory },
    );

    log("\n" + generateClient.split("\n").slice(0, 4).join("\n") + "\n");

    // log(generateClient);
  } catch (err) {
    logError(PREDEFINED_LOG_MESSAGES.generatePrismaClient.error);
    // log(err);
  }
}

export async function installStudio(directory: string) {
  try {
    const { spawn } = require("child_process");

    log(PREDEFINED_LOG_MESSAGES.installStudio.action);

    await spawn("npx", ["prisma", "studio", "--browser", "none"], {
      cwd: directory,
    });

    logSuccess(PREDEFINED_LOG_MESSAGES.installStudio.success);

    return true;
  } catch (err) {
    logError(PREDEFINED_LOG_MESSAGES.installStudio.error);
    log(err);
    return false;
  }
}

export async function writeClientInLib(path: string) {
  const existingContent = existsSync(path);

  try {
    if (!existingContent) {
      const prismaClient = `import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
`;

      if (!existsSync("lib")) {
        mkdirSync("lib");
      }

      if (existsSync("lib/prisma.ts")) {
        log(PREDEFINED_LOG_MESSAGES.writeClientInLib.found);
        return;
      }

      writeFileSync("lib/prisma.ts", prismaClient);

      logSuccess(PREDEFINED_LOG_MESSAGES.writeClientInLib.success);
    }
  } catch (e: any) {
    log(e);
  }
}
