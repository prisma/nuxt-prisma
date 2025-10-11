import type { PrismaSetupContext, PrismaService } from "../types";
import {
  generatePrismaClient,
  writeClientInLib,
} from "../package-utils/setup-helpers";
import consola from "consola";

export class ClientService implements PrismaService {
  async execute(context: PrismaSetupContext): Promise<void> {
    await this.generateClient(context);
    await this.writeClientInLib(context);
  }

  private async generateClient(context: PrismaSetupContext): Promise<void> {
    if (!context.options.client.generate) {
      consola.info("Client generation disabled, skipping...");
      return;
    }

    consola.info("Generating Prisma client...");

    try {
      const forceExit = context.options.log?.includes("error");
      await generatePrismaClient(
        context.projectPath,
        this.getSchemaCmdArgs(context),
        forceExit,
      );
    } catch (error) {
      consola.warn(
        "Client generation failed, but continuing with existing client",
      );
      consola.warn(`Error details: ${error}`);
      // Don't throw - allow workflow to continue with existing client
    }
  }

  private async writeClientInLib(context: PrismaSetupContext): Promise<void> {
    consola.info("Writing Prisma client to lib...");
    await writeClientInLib(context.layerPath);
  }

  private getSchemaCmdArgs(context: PrismaSetupContext): string[] {
    return context.options.schema.path
      ? ["--schema", context.options.schema.path]
      : [];
  }
}
