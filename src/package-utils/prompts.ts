import { consola } from "consola";
import type { PromptOptions } from "consola";

// Internal memoization to ensure prompts are not run twice in the same process
let hasPromptedMigrate = false;
let cachedMigrateAnswer = false;
let hasPromptedCreateDb = false;
let cachedCreateDbAnswer = false;

export async function promptUserForPrismaMigrate(initial: boolean = true): Promise<boolean> {
  if (hasPromptedMigrate) return cachedMigrateAnswer;
  try {
    const answer = (await consola.prompt(
      "Do you want to migrate database changes to your database?",
      { type: "confirm", initial } as PromptOptions
    )) as boolean;
    cachedMigrateAnswer = !!answer;
    hasPromptedMigrate = true;
    return cachedMigrateAnswer;
  } catch (error) {
    consola.error("Error during migrate prompt:", error);
    hasPromptedMigrate = true;
    cachedMigrateAnswer = false;
    return false;
  }
}

export async function promptUserForCreateDb(initial: boolean = true): Promise<boolean> {
  if (hasPromptedCreateDb) return cachedCreateDbAnswer;
  try {
    const answer = (await consola.prompt(
      "Do you want to create a free Prisma Postgres database now?",
      { type: "confirm", initial } as PromptOptions
    )) as boolean;
    cachedCreateDbAnswer = !!answer;
    hasPromptedCreateDb = true;
    return cachedCreateDbAnswer;
  } catch (error) {
    consola.error("Error during create-db prompt:", error);
    hasPromptedCreateDb = true;
    cachedCreateDbAnswer = false;
    return false;
  }
}