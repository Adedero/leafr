<script setup lang="ts">
const open = defineModel<boolean>("open", { default: false });
</script>

<template>
  <Transition>
    <div>Footer</div>
  </Transition>
</template>
