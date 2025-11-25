import { x } from "tinyexec";
import { consola } from "consola";

export type PrismaInitOptions = {
  directory: string;
  datasourceProvider?: "postgresql" | "mysql" | "sqlite" | "sqlserver" | "cockroachdb";
  generatorProvider?: string;
  previewFeatures?: string[];
  output?: string;
  url?: string;
  /** Provisions a Prisma Postgres database on the Prisma Data Platform */
  db?: boolean;
  /** Adds example User model to the created schema file */
  withModel?: boolean;
};

export async function initPrisma({
  directory,
  datasourceProvider,
  generatorProvider,
  previewFeatures,
  output,
  url,
  db,
  withModel,
}: PrismaInitOptions) {
  const commandArgs = ["prisma@latest", "init"];

  if (db) {
    commandArgs.push("--db");
  } else if (datasourceProvider) {
    commandArgs.push("--datasource-provider", datasourceProvider);
  }

  if (generatorProvider) {
    commandArgs.push("--generator-provider", generatorProvider);
  }

  if (Array.isArray(previewFeatures)) {
    for (const feature of previewFeatures) {
      commandArgs.push("--preview-feature", feature);
    }
  }

  if (output) {
    commandArgs.push("--output", output);
  }

  if (url) {
    commandArgs.push("--url", url);
  }

  if (withModel) {
    commandArgs.push("--with-model");
  }

  consola.info("[Prisma] Initializing project...");
  const { stderr, exitCode } = await x("npx", commandArgs, {
    nodeOptions: { cwd: directory, shell: true, stdio: "inherit" },
  });

  if (exitCode !== 0) {
    consola.error("[Prisma] Failed to initialize project.", stderr);
    return false;
  }

  consola.success("[Prisma] Project initialized.");
  return true;
}

export async function formatSchema(directory: string, schemaPath: string[]) {
  consola.info("[Prisma] Formatting schema...");

  const { stderr, exitCode } = await x("npx", ["prisma", "format", ...schemaPath], {
    nodeOptions: { cwd: directory, shell: true, stdio: "inherit" },
  });

  if (exitCode !== 0) {
    consola.error("[Prisma] Failed to format schema.", stderr);
    return false;
  }

  consola.success("[Prisma] Schema formatted.");
  return true;
}

export async function generatePrismaClient(directory: string, schemaPath: string[]) {
  consola.info("[Prisma] Generating client...");

  try {
    const { stderr, exitCode } = await x("npx", ["prisma", "generate", ...schemaPath], {
      nodeOptions: { cwd: directory, shell: true, stdio: "inherit" },
    });

    if (exitCode !== 0) {
      // Non-blocking - user can run prisma generate manually
      consola.warn("[Prisma] Run 'npx prisma generate' after setup completes");
      return false;
    }

    consola.success("[Prisma] Client generated.");
    return true;
  } catch {
    consola.warn("[Prisma] Run 'npx prisma generate' after setup completes");
    return false;
  }
}

export async function startPrismaStudio(directory: string, schemaPath: string[], port?: number) {
  consola.info("[Prisma] Starting Studio...");

  try {
    const args = ["prisma", "studio", "--browser", "none"];
    if (port) {
      args.push("--port", String(port));
    }
    args.push(...schemaPath);

    // Fire-and-forget: don't await the long-running Studio process
    x("npx", args, {
      nodeOptions: { cwd: directory },
      throwOnError: false,
    });

    consola.success("[Prisma] Studio started.");
    return true;
  } catch (err) {
    consola.error("[Prisma] Failed to start Studio.", err);
    return false;
  }
}
