import type { PrismaSetupContext, PrismaService } from "../types";
import {
  checkIfMigrationsFolderExists,
  runMigration,
  formatSchema,
} from "../package-utils/setup-helpers";
import { executeRequiredPrompts } from "../package-utils/prompts";
import { PREDEFINED_LOG_MESSAGES } from "../package-utils/log-helpers";
import { EnvironmentDetector } from "../utils/environment-detector";
import consola from "consola";

export class MigrationService implements PrismaService {
  async execute(context: PrismaSetupContext): Promise<void> {
    await this.handleMigrations(context);
  }

  private async handleMigrations(context: PrismaSetupContext): Promise<void> {
    const { migration } = context.options;

    if (!migration.enabled) {
      consola.info("Migrations disabled, skipping...");
      return;
    }

    if (this.migrationsExist(context)) {
      consola.info(PREDEFINED_LOG_MESSAGES.skipMigrations);
      return;
    }

    if (migration.autoRun || context.options.autoSetup) {
      await this.runMigration(context);
      return;
    }

    const shouldSkipPrompts = EnvironmentDetector.shouldSkipPrompts(
      context.options,
    );
    if (shouldSkipPrompts) {
      return;
    }

    const shouldMigrate = await this.askForMigration();
    if (shouldMigrate) {
      await this.runMigration(context);
    }
  }

  private migrationsExist(context: PrismaSetupContext): boolean {
    return checkIfMigrationsFolderExists(context.migrationsPath);
  }

  private async runMigration(context: PrismaSetupContext): Promise<void> {
    consola.info("Running Prisma migration...");
    await runMigration(context.projectPath, this.getSchemaCmdArgs(context));

    if (context.options.schema.format) {
      await formatSchema(context.projectPath, this.getSchemaCmdArgs(context));
    }
  }

  private async askForMigration(): Promise<boolean> {
    const promptResult = await executeRequiredPrompts({
      promptForMigrate: true,
    });

    return promptResult?.promptForPrismaMigrate ?? false;
  }

  private getSchemaCmdArgs(context: PrismaSetupContext): string[] {
    return context.options.schema.path
      ? ["--schema", context.options.schema.path]
      : [];
  }
}
