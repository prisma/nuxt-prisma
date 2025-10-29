export default defineEventHandler(async (event) => {
  try {
    const prisma = usePrisma()
    
    // Your queries
    
  } catch (error) {
    throw createError({ statusCode: 500, data: error })
  }
})
