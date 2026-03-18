<script setup lang="ts">
const { text } = useBooksSearch();
</script>

<template>
  <InputText v-model="text" placeholder="Title or author..." icon="lucide:search" />
</template>
