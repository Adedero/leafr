<script setup lang="ts">
import type { UIAction } from "@renderer/types/ui.type";

interface Props {
  title?: string;
  error?: unknown;
  description?: string;
}

const { title = undefined, error = undefined, description = undefined } = defineProps<Props>();

const emit = defineEmits<{
  retry: [];
}>();

const computedDescription = computed(() => {
  if (error) {
    return toErrorMessage(error);
  }
  return description;
});

const actions = computed<UIAction[]>(() => {
  if (getCurrentInstance()?.vnode?.props?.["onRetry"]) {
    return [
      {
        label: "Retry",
        icon: "lucide:refresh-ccw",
        color: "error",
        onClick: () => emit("retry")
      }
    ];
  }
  return [];
});
</script>

<template>
  <Alert
    :title="title || 'Error'"
    :description="computedDescription"
    :actions="actions"
    color="error"
  />
</template>
