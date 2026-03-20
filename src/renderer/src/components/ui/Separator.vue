<script setup lang="ts">
defineProps<{
  label?: string;
  width?: string;
  orientation?: "horizontal" | "vertical";
}>();
</script>

<template>
  <div
    :class="[
      'flex items-center  text-muted text-sm',
      orientation === 'vertical'
        ? 'flex-col w-fit self-stretch'
        : 'flex-row w-full',
      $slots.label ? 'gap-3' : ''
    ]"
  >
    <div
      :class="
        orientation === 'vertical'
          ? 'flex-1 bg-border'
          : 'h-px flex-1 bg-border'
      "
      :style="{ width: width ?? '2px' }"
    />
    <slot>
      <span v-if="label">{{ label }}</span>
    </slot>
    <div
      :class="
        orientation === 'vertical'
          ? 'flex-1 bg-border'
          : 'h-px flex-1 bg-border'
      "
      :style="{ width: width ?? '2px' }"
    />
  </div>
</template>
