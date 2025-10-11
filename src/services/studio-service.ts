import type { PrismaSetupContext, PrismaService } from "../types";
import { startPrismaStudio } from "../package-utils/setup-helpers";
import { PREDEFINED_LOG_MESSAGES } from "../package-utils/log-helpers";
import { addCustomTab } from "@nuxt/devtools-kit";
import consola from "consola";

export class StudioService implements PrismaService {
  async execute(context: PrismaSetupContext): Promise<void> {
    await this.setupStudio(context);
  }

  private async setupStudio(context: PrismaSetupContext): Promise<void> {
    const { studio } = context.options;

    if (!studio.enabled || !this.isDevMode(context)) {
      consola.info(PREDEFINED_LOG_MESSAGES.skipInstallingPrismaStudio);
      return;
    }

    const port = studio.port || 5555;
    await this.startStudio(context, port);
    await this.addDevToolsTab(port);
  }

  private isDevMode(context: PrismaSetupContext): boolean {
    return context.environment.npmLifecycleEvent === "dev";
  }

  private async startStudio(
    context: PrismaSetupContext,
    port: number,
  ): Promise<void> {
    consola.info(`Starting Prisma Studio on port ${port}...`);
    await startPrismaStudio(
      context.projectPath,
      this.getSchemaCmdArgs(context),
    );
  }

  private async addDevToolsTab(port: number): Promise<void> {
    addCustomTab({
      name: "nuxt-prisma",
      title: "Prisma Studio",
      icon: "simple-icons:prisma",
      category: "server",
      view: {
        type: "iframe",
        src: `http://localhost:${port}/`,
        persistent: true,
      },
    });
  }

  private getSchemaCmdArgs(context: PrismaSetupContext): string[] {
    return context.options.schema.path
      ? ["--schema", context.options.schema.path]
      : [];
  }
}
