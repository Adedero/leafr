<script setup lang="ts">
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
