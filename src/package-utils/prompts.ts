import { consola, PromptOptions } from "consola";

type RequiredPromptTypes = {
  promptForMigrate?: boolean;
};

enum RequiredPromptNames {
  PROMPT_MIGRATE = "promptForPrismaMigrate"
}

type RequiredPromptAnswers = {
  [RequiredPromptNames.PROMPT_MIGRATE]: boolean;
};

interface CustomPromptOptions {
  message: string;
  options: PromptOptions;
  key: RequiredPromptNames;
}

export async function executeRequiredPrompts({
  promptForMigrate = true
}: RequiredPromptTypes): Promise<RequiredPromptAnswers | null> {
  const options: CustomPromptOptions[] = [];

  if (promptForMigrate) {
    options.push({
      message: "Do you want to migrate database changes to your database?",
      options: {
        type: "confirm",
        initial: true
      },
      key: RequiredPromptNames.PROMPT_MIGRATE
    });
  }

  if (options.length === 0) {
    return null;
  }

  try {
    const answers: RequiredPromptAnswers = {
      [RequiredPromptNames.PROMPT_MIGRATE]: false
    };

    for (const { message, options: promptOptions, key } of options) {
      answers[key] = (await consola.prompt(message, promptOptions)) as boolean; // Explicitly cast the response to a boolean since it's only boolean prompts for now
    }

    return answers;
  } catch (error) {
    consola.error("Error during prompts execution:", error);
    return null;
  }
}