/* eslint-disable @typescript-eslint/no-unused-vars */
import { existsSync } from "fs";

type PackageManager = "npm" | "yarn" | "pnpm";

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

  // Default to npm if none of the above are found
  return "npm";
}
