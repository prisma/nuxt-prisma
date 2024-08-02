<script lang="ts" setup>
const prisma = usePrismaClient();
const post = await prisma.post.findFirst();
</script>

<template>
  <div>
    <div>Posts</div>
    <p>{{ post?.title ?? "There is no post." }}</p>
  </div>
</template>
