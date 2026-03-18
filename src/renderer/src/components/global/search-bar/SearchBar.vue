<script setup lang="ts">
import AllBooksSearchBar from './AllBooksSearchBar.vue';
import CurrentBookSearchBar from './CurrentBookSearchBar.vue';

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
  <Component :is="component" v-if="component" />
</template>
