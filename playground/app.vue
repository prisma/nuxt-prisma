<template>
  <div>
    Nuxt module playground!
  </div>
</template>

<script setup>
const prisma = usePrisma()
const posts = await prisma.post.findMany()

</script>
