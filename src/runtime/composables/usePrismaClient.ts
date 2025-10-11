import { useNuxtApp } from "#imports";
import type { CustomPrismaClient } from "../server/utils/prisma";

export const usePrismaClient = (): CustomPrismaClient => {
  const { $prisma } = useNuxtApp();
  
  if (!$prisma) {
    throw new Error("Prisma client is not available. Make sure you're running this on server-side.");
  }
  
  return $prisma as CustomPrismaClient;
};
