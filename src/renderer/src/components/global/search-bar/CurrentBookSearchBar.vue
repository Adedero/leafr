<script setup lang="ts">
const { text, isClicked } = useBooksSearch();
</script>

<template>
  <InputText
    ref="inputRef"
    v-model="text"
    placeholder="Search book..."
    icon="lucide:search"
    @click="isClicked = true"
  />
</template>
