<script setup lang="ts">
const { data, error } = await useFetch("/api/hello");
</script>

<template>
  <div>
    <div v-if="error">Error loading data: {{ error }}</div>
    <div v-else>
      {{ data }}
    </div>
  </div>
</template>
