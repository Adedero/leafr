<script setup lang="ts">
const { settings, PAGE_LAYOUTS } = useBookSettings();
</script>

<template>
  <div>
    <p class="font-semibold">Page Layout</p>
    <div
      class="grid bg-muted/30 mt-1 p-1"
      :style="{ gridTemplateColumns: `repeat(${PAGE_LAYOUTS.length}, 1fr)` }"
    >
      <button
        v-for="layout in PAGE_LAYOUTS"
        :key="layout"
        :class="[
          'px-2 py-1',
          settings.flow === layout ? 'bg-surface text-primary' : ''
        ]"
        @click="settings.flow = layout"
      >
        {{ layout }}
      </button>
    </div>
  </div>
</template>
