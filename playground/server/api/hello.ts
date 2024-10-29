export default defineEventHandler(async (event) => {
  const firstUser = await prisma.user.findFirst();
  return {
    firstPost: firstUser,
  };
});
