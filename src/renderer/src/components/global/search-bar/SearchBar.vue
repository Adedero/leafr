<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AllBooksSearchBar from "./AllBooksSearchBar.vue";
import CurrentBookSearchBar from "./CurrentBookSearchBar.vue";

const route = useRoute();

const component = computed(() => {
  switch (route.name) {
    case "home":
      return AllBooksSearchBar;
    case "book":
      return CurrentBookSearchBar;
    default:
      return null;
  }
});
</script>

<template>
  <Component v-if="component" :is="component" />
</template>
