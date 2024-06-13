/* eslint-disable @typescript-eslint/no-unused-vars */
import { existsSync } from "fs";

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

function detectPackageManager(): PackageManager {
  // Check for package-lock.json
  if (existsSync("package-lock.json")) {
    return "npm";
  }

  // Check for yarn.lock
  if (existsSync("yarn.lock")) {
    return "yarn";
  }

  // Check for pnpm-lock.yaml
  if (existsSync("pnpm-lock.yaml")) {
    return "pnpm";
  }

  // bun.lockb
  if (existsSync("bun.lockb")) {
    return "bun";
  }

  // Default to npm if none of the above are found
  return "npm";
}

export const installingPrismaCLIWithPM = () => {
  const pm = detectPackageManager();

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

export const installingPrismaClientWithPM = () => {
  const pm = detectPackageManager();

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
