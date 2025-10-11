import type { PrismaSetupContext, PrismaService } from "../types";
import {
  checkIfPrismaSchemaExists,
  writeToSchema,
  formatSchema,
  initPrisma,
} from "../package-utils/setup-helpers";
import consola from "consola";

export class SchemaService implements PrismaService {
  async execute(context: PrismaSetupContext): Promise<void> {
    await this.ensureSchema(context);
  }

  private async ensureSchema(context: PrismaSetupContext): Promise<void> {
    if (!this.schemaExists(context)) {
      await this.createSchema(context);
    }

    if (context.options.schema.write) {
      await this.writeContent(context);
    }

    if (context.options.schema.format) {
      await this.formatSchema(context);
    }
  }

  private schemaExists(context: PrismaSetupContext): boolean {
    return checkIfPrismaSchemaExists([
      context.schemaPath,
      `${context.layerPath}/prisma/schema.prisma`,
    ]);
  }

  private async createSchema(context: PrismaSetupContext): Promise<void> {
    consola.info("Creating Prisma schema...");

    const success = await initPrisma({
      directory: context.layerPath,
      rootDir: context.projectPath,
      provider: context.options.provider || "sqlite",
    });

    if (!success) {
      throw new Error("Failed to initialize Prisma project");
    }
  }

  private async writeContent(context: PrismaSetupContext): Promise<void> {
    await writeToSchema(context.schemaPath);
  }

  private async formatSchema(context: PrismaSetupContext): Promise<void> {
    consola.info("Formatting Prisma schema...");
    await formatSchema(context.projectPath, this.getSchemaCmdArgs(context));
  }

  private getSchemaCmdArgs(context: PrismaSetupContext): string[] {
    return context.options.schema.path
      ? ["--schema", context.options.schema.path]
      : [];
  }
}
