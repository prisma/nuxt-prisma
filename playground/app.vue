<script lang="ts" setup>
  async function main() {
    try {
    const prisma = usePrismaClient()
    const posts = await prisma.post.findMany()
    console.log(posts)
    } catch (error) {
      console.log(error)
    }
  }
  main()
</script>

<template>
  <div>
    Nuxt module playground!
  </div>
</template>
