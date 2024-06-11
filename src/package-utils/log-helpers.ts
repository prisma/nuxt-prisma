import chalk from "chalk";

export function logSuccess(message: string) {
  console.log(chalk.green(`✔ ${message}`));
}

export function logError(message: string) {
  console.error(chalk.red(`✘ ${message}`));
}

export function log(message: any) {
  console.log(message);
}

export const PREDEFINED_LOG_MESSAGES = {
  isPrismaCLIinstalled: {
    yes: chalk.bold("Prisma CLI") + " is already installed.",
    no: "Failed to install " + chalk.bold("Prisma CLI") + ".",
  },
  installPrismaCLI: {
    yes: "Successfully installed " + chalk.bold("Prisma CLI") + ".",
    no: "Failed to install " + chalk.bold("Prisma CLI") + ".",
  },
  checkIfPrismaSchemaExists: {
    yes: "Prisma schema file exists.",
    no: "Prisma schema file does not exist.",
  },
  initPrisma: {
    error: "Failed to initialize Prisma project.",
  },
  checkIfMigrationsFolderExists: {
    success: "Database migrations folder exists.",
    error: "Database migrations folder does not exist.",
  },
  writeToSchema: {
    errorReadingFile: "Error reading existing schema file.",
    failedToWrite: "Failed to write model to Prisma schema.",
  },
  runMigration: {
    success: "Created User and Post tables in your database.",
    error: "Failed to run Prisma migration.",
  },
  formatSchema: {
    error: "Failed to format Prisma schema file.",
  },
  generatePrismaClient: {
    error: "Failed to generate Prisma Client.",
  },
  installStudio: {
    success: `Prisma Studio installed. After clicking 'Get Started' in Nuxt DevTools,
    click on the three dots in the lower left-hand side to reveal additional tabs.
    Locate the Prisma logo to open Prisma Studio.`,
    error: "Failed to install Prisma Studio.",
  },
  writeClientInLib: {
    success:
      "Global instance of Prisma Client successfully created within lib/prisma.ts file.",
  },
  PRISMA_SETUP_SKIPPED_WARNING: chalk.yellow(
    chalk.bold("Warning") +
      ": Nuxt Prisma Module setup skipped. This may cause the module to behave unexpectedly.",
  ),
};
