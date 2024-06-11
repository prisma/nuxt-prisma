import { useNuxtApp } from "#imports";
import type { CustomPrismaClient } from "../server/utils/prisma";

export const usePrismaClient = () => {
  return useNuxtApp().$prisma as CustomPrismaClient;
};
