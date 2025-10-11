import type { PrismaSetupContext } from "../types";
import { SchemaService } from "./schema-service";
import { MigrationService } from "./migration-service";
import { ClientService } from "./client-service";
import { StudioService } from "./studio-service";
import consola from "consola";

export class PrismaOrchestrator {
  private services: Array<{ name: string; service: any }>;

  constructor() {
    this.services = [
      { name: "Schema", service: new SchemaService() },
      { name: "Migration", service: new MigrationService() },
      { name: "Client", service: new ClientService() },
      { name: "Studio", service: new StudioService() },
    ];
  }

  async executeSetup(context: PrismaSetupContext): Promise<void> {
    consola.info("Starting Prisma setup workflow...");

    for (const { name, service } of this.services) {
      try {
        consola.info(`Executing ${name} service...`);
        await service.execute(context);
      } catch (error) {
        consola.error(`Failed to execute ${name} service:`, error);

        if (context.options.security.enableErrorReporting) {
          throw error;
        }

        consola.warn(`Continuing setup despite ${name} service failure...`);
      }
    }

    consola.success("Prisma setup workflow completed!");
  }
}
