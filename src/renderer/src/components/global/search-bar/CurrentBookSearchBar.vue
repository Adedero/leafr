<script setup lang="ts">
import useBooksSearch from "@renderer/hooks/use-books-search";

const { text } = useBooksSearch();
</script>

<template>
  <InputText v-model="text" placeholder="Search book..." icon="lucide:search" />
</template>
