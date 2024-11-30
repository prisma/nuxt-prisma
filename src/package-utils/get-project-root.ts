import { existsSync } from "fs";
import path from "path";

export default function getProjectRoot(): string {
  let projectRoot = process.cwd();

  // Find the project root, in case workspaces are being used.
  // Please note that resolveProject will not work, since it picks the layer directory.
  do {
    projectRoot = path.resolve(projectRoot, "..");
  } while (projectRoot !== "/" && !existsSync(`${projectRoot}/package.json`));

  return projectRoot;
}
