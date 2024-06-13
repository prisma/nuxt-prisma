import prompts, { type PromptObject, type Answers } from "prompts";

export type RequiredPromptTypes = {
  promptForMigrate?: boolean;
  promptForPrismaStudio?: boolean;
};

enum RequiredPromptNames {
  PROMPT_MIGRATE = "promptForPrismaMigrate",
  PROMPT_STUDIO = "promptForInstallingStudio",
}

export type RequiredPromptAnswers = {
  [RequiredPromptNames.PROMPT_MIGRATE]: boolean;
  [RequiredPromptNames.PROMPT_STUDIO]: boolean;
};

export async function executeRequiredPrompts({
  promptForMigrate = true,
  promptForPrismaStudio = true,
}: RequiredPromptTypes): Promise<RequiredPromptAnswers | null> {
  const options: PromptObject[] = [];

  // Add migration prompt if required
  if (promptForMigrate) {
    options.push({
      type: "confirm",
      name: RequiredPromptNames.PROMPT_MIGRATE,
      message: "Do you want to migrate database changes to your database?",
      initial: true,
    });
  }

  // Add Prisma Studio prompt if required
  if (promptForPrismaStudio) {
    options.push({
      type: "confirm",
      name: RequiredPromptNames.PROMPT_STUDIO,
      message:
        "Do you want to view and edit your data by installing Prisma Studio in Nuxt DevTools?",
      initial: true,
    });
  }

  // If no prompts are required, return null
  if (options.length === 0) {
    return null;
  }

  try {
    // Execute the prompts and await the responses
    const answers: Answers<string> = await prompts(options);

    // Construct the result object with explicit type checking
    const result: RequiredPromptAnswers = {
      [RequiredPromptNames.PROMPT_MIGRATE]:
        answers[RequiredPromptNames.PROMPT_MIGRATE] ?? false,
      [RequiredPromptNames.PROMPT_STUDIO]:
        answers[RequiredPromptNames.PROMPT_STUDIO] ?? false,
    };

    return result;
  } catch (error) {
    // Log any errors encountered during the prompt execution
    console.error("Error during prompts execution:", error);
    return null;
  }
}
