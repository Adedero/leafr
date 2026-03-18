<script setup lang="ts">
import { ToastRoot, ToastTitle, ToastDescription, ToastAction, ToastViewport } from "reka-ui";
import useToast from "@renderer/hooks/use-toast";
import { UIColor } from "@renderer/types/ui.type";
import Icon from "./Icon.vue";

const { toasts } = useToast();

const toastHeaderClass = (color: UIColor) => {
  switch (color) {
    case "neutral":
      return "bg-transparent text-text";
    default:
      return `bg-${color}  text-surface`;
  }
};

const meterBgStyle = (color: UIColor) => {
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
    v-model:open="toast.open"
    :duration="toast.duration"
    v-slot="{ duration, remaining }"
    class="toast-root bg-surface border-2 border-border p-1 grid gap-x-4"
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

    <ToastDescription v-if="toast.description" class="text-sm p-2">
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

  <ToastViewport class="z-100 fixed bottom-0 right-0 flex flex-col p-6 gap-3 w-100 max-w-[100vw]" />
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
