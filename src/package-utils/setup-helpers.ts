import { x } from "tinyexec";
import { PREDEFINED_LOG_MESSAGES } from "./log-helpers";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "pathe";
import consola from "consola";

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

export function checkIfPrismaSchemaExists(paths: string[]) {
  const exists = paths.reduce((prev, current) => {
    return existsSync(current) || prev;
  }, false);

  if (exists) {
    consola.success(PREDEFINED_LOG_MESSAGES.checkIfPrismaSchemaExists.yes);
    return true;
  }

  consola.info(PREDEFINED_LOG_MESSAGES.checkIfPrismaSchemaExists.no);
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
      consola.warn(`Source .env file does not exist in directory: ${dirB}`);
      return;
    }

    const envContentB = readFileSync(envFileB, "utf8");

    if (existsSync(envFileA)) {
      const envContentA = readFileSync(envFileA, "utf8");

      if (envContentA.match(/^DATABASE_URL=.+$/gm)) {
        return;
      }

      const combinedContent = `${envContentA}\n${envContentB}`;
      writeFileSync(envFileA, combinedContent, "utf8");
    } else {
      writeFileSync(envFileA, envContentB, "utf8");
    }

    consola.success(
      `Successfully moved content from ${envFileB} to ${envFileA}`,
    );
  } catch (error) {
    consola.error(`Failed to move .env file content: ${error}`);
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

  consola.info(PREDEFINED_LOG_MESSAGES.initPrisma.action);

  const { stderr, exitCode } = await x("npx", commandArgs, {
    nodeOptions: {
      cwd: directory,
    },
  });

  if (exitCode !== 0) {
    consola.error(PREDEFINED_LOG_MESSAGES.initPrisma.error, stderr);
    return false;
  }

  consola.success(PREDEFINED_LOG_MESSAGES.initPrisma.success);

  try {
    moveEnvFileContent(rootDir, directory);
  } catch (error) {
    consola.error(error);
  }

  return true;
}

export function checkIfMigrationsFolderExists(path: string) {
  if (existsSync(path)) {
    consola.success(
      PREDEFINED_LOG_MESSAGES.checkIfMigrationsFolderExists.success,
    );
    return true;
  }

  consola.info(PREDEFINED_LOG_MESSAGES.checkIfMigrationsFolderExists.error);
  return false;
}

export async function writeToSchema(prismaSchemaPath: string) {
  try {
    let existingSchema = "";

    try {
      existingSchema = readFileSync(prismaSchemaPath, "utf-8");
    } catch {
      consola.error(PREDEFINED_LOG_MESSAGES.writeToSchema.errorReadingFile);
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
    consola.error(PREDEFINED_LOG_MESSAGES.writeToSchema.failedToWrite);
  }
}

export async function runMigration(directory: string, schemaPath: string[]) {
  consola.info(PREDEFINED_LOG_MESSAGES.runMigration.action);

  const { stderr, exitCode } = await x(
    "npx",
    ["prisma", "migrate", "dev", "--name", "init"].concat(schemaPath),
    {
      nodeOptions: {
        cwd: directory,
      },
    },
  );

  if (exitCode !== 0) {
    consola.error(PREDEFINED_LOG_MESSAGES.runMigration.error, stderr);
    return false;
  }

  consola.success(PREDEFINED_LOG_MESSAGES.runMigration.success);
  return true;
}

export async function formatSchema(directory: string, schemaPath: string[]) {
  consola.info(PREDEFINED_LOG_MESSAGES.formatSchema.action);

  const { stderr, exitCode } = await x(
    "npx",
    ["prisma", "format"].concat(schemaPath),
    {
      nodeOptions: {
        cwd: directory,
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

  const { stderr, exitCode } = await x(
    "npx",
    ["prisma", "generate"].concat(prismaSchemaPath),
    {
      nodeOptions: {
        cwd: directory,
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
) {
  consola.info(PREDEFINED_LOG_MESSAGES.startPrismaStudio.action);

  try {
    const proc = x(
      "npx",
      ["prisma", "studio", "--browser", "none"].concat(schemaLocation),
      {
        nodeOptions: {
          cwd: directory,
        },
        throwOnError: true,
      },
    );

    proc.process?.unref();

    consola.success(PREDEFINED_LOG_MESSAGES.startPrismaStudio.success);
    consola.info(PREDEFINED_LOG_MESSAGES.startPrismaStudio.info);

    return true;
  } catch (err) {
    consola.error(PREDEFINED_LOG_MESSAGES.startPrismaStudio.error);
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
        consola.info(PREDEFINED_LOG_MESSAGES.writeClientInLib.found);
        return;
      }

      writeFileSync(`${path}/lib/prisma.ts`, prismaClient);

      consola.success(PREDEFINED_LOG_MESSAGES.writeClientInLib.success);
    }
  } catch (err) {
    consola.error(err);
  }
}
