<script setup lang="ts">
import InputText from "@renderer/components/ui/InputText.vue";
import useBooksSearch from "@renderer/hooks/use-books-search";

const { text } = useBooksSearch();
</script>

<template>
  <InputText v-model="text" placeholder="Search book..." icon="lucide:search" />
</template>
