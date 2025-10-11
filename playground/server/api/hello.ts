import prisma from "~/database/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const firstUser = await prisma.user.findFirst();
    return {
      success: true,
      firstUser: firstUser,
    };
  } catch (error) {
    console.error("Database error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Database connection error",
    });
  }
});
