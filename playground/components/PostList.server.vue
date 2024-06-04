<script lang="ts" setup>
const prisma = usePrismaClient();
const posts = await prisma.post.findMany();
</script>

<template>
  <div>Posts</div>
  <li
    v-for="post in posts"
    :key="post.id"
  >
    {{ post.title }}
  </li>
</template>
