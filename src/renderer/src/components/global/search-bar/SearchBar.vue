<script setup lang="ts">
import AllBooksSearchBar from "./AllBooksSearchBar.vue";
import AllLabelsSearchBar from "./AllLabelsSearchBar.vue";
import CurrentBookSearchBar from "./CurrentBookSearchBar.vue";

const route = useRoute();

const component = computed(() => {
  switch (route.name) {
    case "home":
      return AllBooksSearchBar;
    case "library":
      return AllLabelsSearchBar;
    case "book":
      return CurrentBookSearchBar;
    default:
      return null;
  }
});
</script>

<template>
  <Component :is="component" v-if="component" />
</template>
