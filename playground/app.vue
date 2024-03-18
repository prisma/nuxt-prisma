<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script lang="ts" setup>
  async function main() {
    const prisma = usePrismaClient()
    const posts = await prisma.post.findMany()
    console.log(posts)
  }
  main()
</script>
