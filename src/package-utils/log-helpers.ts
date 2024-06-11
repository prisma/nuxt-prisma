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
    yes: `${chalk.bold("Prisma CLI")} is already installed.`,
    no: `Failed to install ${chalk.bold("Prisma CLI")}.`,
  },
  installPrismaCLI: {
    action: "Installing " + chalk.bold("Prisma CLI") + "...",
    yes: `Successfully installed ${chalk.bold("Prisma CLI")}.`,
    no: `Failed to install ${chalk.bold("Prisma CLI")}.`,
  },
  checkIfPrismaSchemaExists: {
    yes: "Prisma schema file exists.",
    no: "Prisma schema file does not exist.",
  },
  initPrisma: {
    action: "Initializing Prisma project...\n",
    error: "Failed to initialize Prisma project.",
  },
  checkIfMigrationsFolderExists: {
    success: "Database migrations folder exists.",
    error: "Database migrations folder does not exist.",
  },
  writeToSchema: {
    errorReadingFile: "Error reading existing schema file.",
    failedToWrite: "Failed to write models to Prisma schema.",
  },
  runMigration: {
    action: "Migrating database schema...\n",
    success: "Created User and Post tables in the database.",
    error: "Failed to run Prisma migration.",
  },
  formatSchema: {
    action: "Formatting Prisma schema...\n",
    success: "Successfully formatted Prisma schema.",
    error: "Failed to format Prisma schema file.",
  },
  generatePrismaClient: {
    action: "Generating Prisma client...\n",
    success: chalk.bold("Prisma Client") + " successfully generated!",
    error: "Failed to generate Prisma Client.",
  },
  installStudio: {
    success:
      chalk.bold(`Prisma Studio`) +
      ` installed.` +
      chalk.white(
        `\nAfter clicking ${chalk.bold("Get Started")} in Nuxt DevTools, click on the ${chalk.bold("three dots (︙)")} in the lower left-hand side to reveal additional tabs.\nLocate the Prisma logo to open Prisma Studio.`,
      ),
    error: "Failed to install Prisma Studio.",
  },
  writeClientInLib: {
    found: "prisma.ts file already exists in the lib folder.",
    success: "Global instance of Prisma Client created in lib/prisma.ts.",
  },
  PRISMA_SETUP_SKIPPED_WARNING: chalk.yellow(
    `${chalk.bold("Warning")}: Nuxt Prisma Module setup skipped.\nThis may cause unexpected behavior.`,
  ),
  skipMigrations: `Database migrations have been ${chalk.yellow.bold("skipped")}.`,
  skipInstallingPrismaStudio:
    "Skipped installing" + chalk.bold(" Prisma Studio") + ".",
  suggestions: {
    migrate:
      chalk.yellow("\nHint: ") +
      `You can manually run migrations by executing ${chalk.cyan.bold("npx prisma migrate dev")} or visit the ${chalk.blue.bold("Prisma Migrate")} docs for more info:\n${chalk.underline.blue("https://pris.ly/nuxt/migrate")}`,
  },
};
