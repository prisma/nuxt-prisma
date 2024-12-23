/* eslint-disable @typescript-eslint/no-unused-vars */
import { existsSync } from "fs";
import { logWarning } from "./log-helpers";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

function detectPackageManager(
  projectRoot: string,
  packageManager?: PackageManager,
): PackageManager {
  // If a package manager was explicitly defined, use that one.
  if (packageManager) return packageManager;

  // Check for package-lock.json
  if (
    existsSync("package-lock.json") ||
    existsSync(`${projectRoot}/package-lock.json`)
  ) {
    return "npm";
  }

  // Check for yarn.lock
  if (existsSync("yarn.lock") || existsSync(`${projectRoot}/yarn.lock`)) {
    return "yarn";
  }

  // Check for pnpm-lock.yaml
  if (
    existsSync("pnpm-lock.yaml") ||
    existsSync(`${projectRoot}/pnpm-lock.yaml`)
  ) {
    return "pnpm";
  }

  // bun.lockb
  if (existsSync("bun.lockb") || existsSync(`${projectRoot}/bun.lockb`)) {
    return "bun";
  }

  // Default to npm if none of the above are found
  logWarning("Could not find any package manager files. Defaulting to npm.");
  return "npm";
}

export const installingPrismaCLIWithPM = (
  projectRoot: string,
  packageManager?: PackageManager,
) => {
  const pm = detectPackageManager(projectRoot, packageManager);

  switch (pm) {
    case "npm": {
      return {
        pm,
        command: ["install", "prisma", "--save-dev"],
      };
    }
    case "pnpm": {
      return {
        pm,
        command: ["add", "-D", "prisma"],
      };
    }
    case "yarn": {
      return {
        pm,
        command: ["add", "-D", "prisma"],
      };
    }
    case "bun": {
      return {
        pm,
        command: ["add", "prisma", "--dev"],
      };
    }
    default: {
      return {
        pm: "npm",
        command: ["install", "prisma", "--save-dev"],
      };
    }
  }
};

export const installingPrismaClientWithPM = (
  projectRoot: string,
  packageManager?: PackageManager,
) => {
  const pm = detectPackageManager(projectRoot, packageManager);

  switch (pm) {
    case "npm": {
      return {
        pm,
        command: ["install", "@prisma/client", "--save-dev"],
      };
    }
    case "pnpm": {
      return {
        pm,
        command: ["add", "-D", "@prisma/client"],
      };
    }
    case "yarn": {
      return {
        pm,
        command: ["add", "-D", "@prisma/client"],
      };
    }
    case "bun": {
      return {
        pm,
        command: ["add", "@prisma/client", "--dev"],
      };
    }
    default: {
      return {
        pm: "npm",
        command: ["install", "@prisma/client", "--save-dev"],
      };
    }
  }
};
