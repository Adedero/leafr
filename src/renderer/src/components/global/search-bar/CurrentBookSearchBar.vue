<script setup lang="ts">

const { text } = useBooksSearch();
</script>

<template>
  <InputText v-model="text" placeholder="Search book..." icon="lucide:search" />
</template>
