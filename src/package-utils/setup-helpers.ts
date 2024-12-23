import { execa } from "execa";
import {
  installingPrismaClientWithPM,
  installingPrismaCLIWithPM,
  type PackageManager,
} from "./detect-pm";
import {
  log,
  logError,
  logSuccess,
  PREDEFINED_LOG_MESSAGES,
} from "./log-helpers";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

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
  rootDir: string;
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

export async function installPrismaCLI(
  directory: string,
  packageManager?: PackageManager,
) {
  try {
    const installCmd = installingPrismaCLIWithPM(directory, packageManager);

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

function moveEnvFileContent(dirA: string, dirB: string) {
  if (dirA === dirB) {
    return;
  }

  const envFileA = join(dirA, ".env");
  const envFileB = join(dirB, ".env");

  try {
    if (!existsSync(envFileB)) {
      console.error(`Source .env file does not exist in directory: ${dirB}`);
      return;
    }

    const envContentB = readFileSync(envFileB, "utf8");

    if (existsSync(envFileA)) {
      const envContentA = readFileSync(envFileA, "utf8");
      const combinedContent = `${envContentA}\n${envContentB}`;
      writeFileSync(envFileA, combinedContent, "utf8");
    } else {
      writeFileSync(envFileA, envContentB, "utf8");
    }

    console.log(`Successfully moved content from ${envFileB} to ${envFileA}`);
  } catch (error) {
    console.error(`Failed to move .env file content: ${error}`);
  }
}

export async function initPrisma({
  directory,
  rootDir,
  provider = "sqlite",
  datasourceUrl,
}: PrismaInitOptions) {
  const commandArgs = ["prisma", "init", "--datasource-provider"];

  commandArgs.push(provider);

  if (datasourceUrl) {
    commandArgs.push("--url");
    commandArgs.push(datasourceUrl);
  }

  try {
    log(PREDEFINED_LOG_MESSAGES.initPrisma.action);

    const { stdout: initializePrisma } = await execa("npx", commandArgs, {
      cwd: directory,
    });

    log(initializePrisma?.split("Next steps")?.[0]);

    try {
      moveEnvFileContent(directory, rootDir);
    } catch (error) {
      console.log();
    }

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

    const addModel = `\
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

    // Don't bother adding the models if they already exist.
    if (existingSchema.trim().includes(addModel.trim())) return;

    const updatedSchema = `${existingSchema.trim()}\n\n${addModel}`;
    writeFileSync(prismaSchemaPath, updatedSchema);
  } catch {
    logError(PREDEFINED_LOG_MESSAGES.writeToSchema.failedToWrite);
  }
}

export async function runMigration(directory: string, schemaPath: string[]) {
  try {
    log(PREDEFINED_LOG_MESSAGES.runMigration.action);

    await execa(
      "npx",
      ["prisma", "migrate", "dev", "--name", "init"].concat(schemaPath),
      {
        cwd: directory,
      },
    );
    logSuccess(PREDEFINED_LOG_MESSAGES.runMigration.success);
    return true;
  } catch (err) {
    logError(PREDEFINED_LOG_MESSAGES.runMigration.error);
    log(err);
    log(PREDEFINED_LOG_MESSAGES.suggestions.migrate);
    return false;
  }
}

export async function formatSchema(directory: string, schemaPath: string[]) {
  try {
    log(PREDEFINED_LOG_MESSAGES.formatSchema.action);
    await execa("npx", ["prisma", "format"].concat(schemaPath), {
      cwd: directory,
    });
  } catch {
    logError(PREDEFINED_LOG_MESSAGES.formatSchema.error);
  }
}

export async function installPrismaClient(
  directory: string,
  installPrismaClient: boolean = true,
  packageManager?: PackageManager,
) {
  log(PREDEFINED_LOG_MESSAGES.generatePrismaClient.action);

  if (installPrismaClient) {
    try {
      const installCmd = installingPrismaClientWithPM(
        directory,
        packageManager,
      );

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
}

export async function generatePrismaClient(
  directory: string,
  prismaSchemaPath: string[],
  verboseLog: boolean = false,
) {
  try {
    const { stdout: generateClient } = await execa(
      "npx",
      ["prisma", "generate"].concat(prismaSchemaPath),
      { cwd: directory },
    );

    log("\n" + generateClient.split("\n").slice(0, 4).join("\n") + "\n");
  } catch (err) {
    logError(PREDEFINED_LOG_MESSAGES.generatePrismaClient.error);
    if (verboseLog) {
      log(err);
    }
  }
}

export async function installStudio(
  directory: string,
  schemaLocation: string[],
) {
  try {
    log(PREDEFINED_LOG_MESSAGES.installStudio.action);

    const subprocess = execa(
      "npx",
      ["prisma", "studio", "--browser", "none"].concat(schemaLocation),
      {
        cwd: directory,
      },
    );

    subprocess.unref();

    logSuccess(PREDEFINED_LOG_MESSAGES.installStudio.success);

    return true;
  } catch (err) {
    logError(PREDEFINED_LOG_MESSAGES.installStudio.error);
    log(err);
    return false;
  }
}

export async function writeClientInLib(path: string) {
  const existingContent = existsSync(`${path}/lib/prisma.ts`);

  try {
    if (!existingContent) {
      const prismaClient = `\
import { PrismaClient } from '@prisma/client'

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

      if (!existsSync(`${path}/lib`)) {
        mkdirSync(`${path}/lib`);
      }

      if (existsSync(`${path}/lib/prisma.ts`)) {
        log(PREDEFINED_LOG_MESSAGES.writeClientInLib.found);
        return;
      }

      writeFileSync(`${path}/lib/prisma.ts`, prismaClient);

      logSuccess(PREDEFINED_LOG_MESSAGES.writeClientInLib.success);
    }
  } catch (e: any) {
    log(e);
  }
}
