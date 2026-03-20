<script setup lang="ts">
const { text } = useBooksSearch();
</script>

<template>
  <InputText
    v-model="text"
    placeholder="Search labels..."
    icon="lucide:search"
  />
</template>
