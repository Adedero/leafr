<script setup lang="ts">
import { ToastRoot, ToastTitle, ToastDescription, ToastViewport } from "reka-ui";
import type { UIColor } from "@renderer/types/ui.type";
import Icon from "./Icon.vue";

const { toasts } = useToast();

const toastHeaderClass = (color: UIColor): string => {
  switch (color) {
    case "neutral":
      return "bg-transparent text-text";
    default:
      return `bg-${color}  text-surface`;
  }
};

const meterBgStyle = (color: UIColor): Record<string, string> => {
  switch (color) {
    case "neutral":
      return {
        backgroundColor: "var(--color-text)"
      };
    default:
      return {
        backgroundColor: `var(--color-${color})`
      };
  }
};
</script>

<template>
  <ToastRoot
    v-for="toast in toasts"
    :key="toast.id"
    v-slot="{ duration, remaining }"
    v-model:open="toast.open"
    :duration="toast.duration"
    class="gap-x-4 grid bg-surface p-1 border-2 border-border toast-root"
  >
    <ToastTitle
      v-if="toast.title"
      :class="[
        'border-2 border-border p-2',
        toastHeaderClass(toast.color),
        toast.icon ? 'flex items-start gap-2' : ''
      ]"
    >
      <Icon v-if="toast.icon" :name="toast.icon" />
      <span> {{ toast.title }}</span>
    </ToastTitle>

    <ToastDescription v-if="toast.description" class="p-2 text-sm">
      {{ toast.description }}
    </ToastDescription>

    <div v-if="duration" class="border-2 border-border">
      <div
        class="h-1"
        :style="{ width: `${(remaining / duration) * 100}%`, ...meterBgStyle(toast.color) }"
      />
    </div>

    <!-- <ToastAction
      v-if="toast.action"
      as-child
      :alt-text="toast.action.label"
    >
      <button @click="toast.action.onClick()">
        {{ toast.action.label }}
      </button>
    </ToastAction> -->
  </ToastRoot>

  <ToastViewport class="right-0 bottom-0 z-100 fixed flex flex-col gap-3 p-6 w-100 max-w-[100vw]" />
</template>

<style>
.toast-root {
  will-change: transform, opacity;
  transition:
    transform 150ms ease,
    opacity 150ms ease;
}

.toast-root[data-state="open"] {
  animation: toast-slide-in-right 200ms ease;
}

.toast-root[data-state="closed"] {
  animation: toast-slide-out-right 200ms ease;
}

.toast-root[data-swipe="move"] {
  transform: translateX(var(--reka-toast-swipe-move-x));
}

.toast-root[data-swipe="cancel"] {
  transform: translateX(0);
  transition: transform 200ms ease;
}

.toast-root[data-swipe="end"] {
  animation: toast-slide-out-right 200ms ease;
}

.toast-left[data-state="open"] {
  animation: toast-slide-in-left 200ms ease;
}

.toast-left[data-state="closed"] {
  animation: toast-slide-out-left 200ms ease;
}
</style>
