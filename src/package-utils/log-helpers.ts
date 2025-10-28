import c from "tinyrainbow";

export const PREDEFINED_LOG_MESSAGES = {
  checkIfPrismaSchemaExists: {
    yes: "Prisma schema file exists.",
    no: "Prisma schema file does not exist.",
  },
  initPrisma: {
    action: "Initializing Prisma project...",
    success: "Initialized the Prisma project.",
    error: "Failed to initialize Prisma project.",
  },
  setupPostgresDatabase: {
    action: "Setting up PostgreSQL database with create-db...",
    success: "PostgreSQL database created successfully!",
    fallback: "Falling back to Docker setup...",
    error: "Failed to setup PostgreSQL database.",
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
    action: "Migrating database schema...",
    success: "Created User and Post tables in the database.",
    error: "Failed to run Prisma migration.",
  },
  formatSchema: {
    action: "Formatting Prisma schema...",
    success: "Successfully formatted Prisma schema.",
    error: "Failed to format Prisma schema file.",
  },
  generatePrismaClient: {
    action: "Generating Prisma client...",
    success: "Successfully generated Prisma client.",
    error: "Failed to generate Prisma Client.",
  },
  startPrismaStudio: {
    action: "Starting Prisma Studio...",
    success: "Prisma Studio started.",
    info: `After clicking ${c.bold("Get Started")} in Nuxt DevTools, click on the ${c.bold("three dots (︙)")} in the lower left-hand side to reveal additional tabs. Locate the Prisma logo to open Prisma Studio.\n`,
    error: "Failed to start Prisma Studio.",
  },
  writeClientInLib: {
    found:
      "Skipping the creation of a lib/prisma.ts file that would hold a global instance of the Prisma Client because the prisma.ts file already exists in the lib folder.",
    success: "Global instance of Prisma Client created in lib/prisma.ts.",
  },
  PRISMA_SETUP_SKIPPED_WARNING:
    "Nuxt Prisma Module setup skipped.\nThis may cause unexpected behavior.",
  skipMigrations: `\nNot migrating the database.`,
  skipInstallingPrismaStudio: "Skipped installing Prisma Studio.",
  suggestions: {
    migrate:
      c.yellow(c.bold("\nHint: ")) +
      `You can manually run migrations by executing ${c.cyan(c.bold("npx prisma migrate dev"))} or visit the ${c.blue(c.bold("Prisma Migrate"))} docs for more info:\n${c.underline(c.blue("https://pris.ly/nuxt/migrate"))}. ` +
      `Or if you have pre-existing data on your database, you have to introspect it. Learn more in our docs:\n${c.underline(c.blue("https://pris.ly/nuxt/dbpull"))}.\n`,
  },
};
