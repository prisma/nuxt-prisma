<script lang="ts" setup>
let user = null;
let error = null;

try {
  const prisma = usePrismaClient();
  user = await prisma.user.findFirst();
} catch (e) {
  error = e;
  console.error("Error fetching user:", e);
}
</script>

<template>
  <div>
    <div>Posts</div>
    <p v-if="error">Error loading user data</p>
    <p v-else>
      {{ user?.email ?? "There is no user." }}
    </p>
  </div>
</template>
