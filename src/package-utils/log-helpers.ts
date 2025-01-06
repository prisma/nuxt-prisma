import chalk from "chalk";

export function logSuccess(message: string) {
  console.log(chalk.green(`✔ ${message}`));
}

export function logWarning(message: string) {
  console.warn(chalk.yellow(`⚠️ ${message}`));
}

export function logError(message: string) {
  console.error(chalk.red(`✘ ${message}`));
}

export function log(message: any) {
  console.log(message);
}

export const PREDEFINED_LOG_MESSAGES = {
  isPrismaCLIinstalled: {
    yes: `Prisma CLI is already installed.`,
    no: `Prisma CLI is not installed.`,
  },
  installPrismaCLI: {
    action: "Installing Prisma CLI...",
    success: `Successfully installed Prisma CLI.`,
    error: `Failed to install Prisma CLI.`,
  },
  getPrismaSchema: {
    yes: "Prisma schema file exists.",
    no: "Prisma schema file does not exist.",
  },
  initPrisma: {
    action: "Initializing Prisma project...\n",
    error: "Failed to initialize Prisma project.",
  },
  getMigrationsFolder: {
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
    prismaClientInstallationError: "Failed to install Prisma Client.\n",
    success: "Prisma Client successfully generated!",
    error: "Failed to generate Prisma Client.\n",
  },
  installStudio: {
    action: "Starting Prisma Studio...\n",
    success:
      `Prisma Studio installed.` +
      chalk.white(
        `\nAfter clicking ${chalk.bold("Get Started")} in Nuxt DevTools, click on the ${chalk.bold("three dots (︙)")} in the lower left-hand side to reveal additional tabs.\nLocate the Prisma logo to open Prisma Studio.`,
      ),
    error: "Failed to install Prisma Studio.",
  },
  writeClientInLib: {
    found:
      "Skipping the creation of a lib/prisma.ts file that would hold a global instance of the Prisma Client because the prisma.ts file already exists in the lib folder.",
    success: "Global instance of Prisma Client created in lib/prisma.ts.",
  },
  PRISMA_SETUP_SKIPPED_WARNING: chalk.yellow(
    `${chalk.bold("Warning")}: Nuxt Prisma Module setup skipped.\nThis may cause unexpected behavior.`,
  ),
  skipMigrations: `\nNot migrating the database.`,
  skipInstallingPrismaStudio: "Skipped installing Prisma Studio.",
  suggestions: {
    migrate:
      chalk.yellow(chalk.bold("\nHint: ")) +
      `You can manually run migrations by executing ${chalk.cyan.bold("npx prisma migrate dev")} or visit the ${chalk.blue.bold("Prisma Migrate")} docs for more info:\n${chalk.underline.blue("https://pris.ly/nuxt/migrate")}. ` +
      `Or if you have pre-existing data on your database, you have to introspect it. Learn more in our docs:\n${chalk.underline.blue("https://pris.ly/nuxt/dbpull")}.\n`,
  },
};
