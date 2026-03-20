<script setup lang="ts">
import { twMerge } from "tailwind-merge";
import type { IconName } from "./Icon.vue";

import type { UIAction, UIColor } from "@renderer/types/ui.type";

export interface AlertUI {
  root: string;
  header: string;
  body: string;
  footer: string;
  icon: string;
  close: string;
}

export interface AlertProps {
  color?: UIColor;
  icon?: IconName;
  title?: string;
  description?: string;
  close?: boolean;
  actions?: UIAction[];
  ui?: Partial<AlertUI>;
}

const {
  color = "neutral",
  icon = undefined,
  title = undefined,
  description = undefined,
  close = false,
  actions = [],
  ui = {}
} = defineProps<AlertProps>();

/* -----------------------
   Internal state
----------------------- */

const visible = ref(true);

function closeAlert() {
  visible.value = false;
}

/* -----------------------
   UI defaults
----------------------- */

const defaultUI: AlertUI = {
  root: "bg-surface border-2 border-border",
  header: "p-2 text-white flex items-center justify-between",
  body: "p-2 border-2",
  footer: "flex justify-end gap-2 p-1 pt-0",
  icon: "flex items-center gap-2",
  close: "cursor-pointer opacity-80 hover:opacity-100"
};

const computedUI = computed(() => ({
  root: twMerge(defaultUI.root, ui?.root),
  header: twMerge(defaultUI.header, ui?.header),
  body: twMerge(defaultUI.body, ui?.body),
  footer: twMerge(defaultUI.footer, ui?.footer),
  icon: twMerge(defaultUI.icon, ui?.icon),
  close: twMerge(defaultUI.close, ui?.close)
}));

/* -----------------------
   Color system
----------------------- */

const colorStyles = computed(() => {
  switch (color) {
    case "primary":
      return {
        header: "bg-primary",
        border: "border-primary"
      };

    case "secondary":
      return {
        header: "bg-secondary",
        border: "border-secondary"
      };

    case "error":
      return {
        header: "bg-error",
        border: "border-error"
      };

    case "warning":
      return {
        header: "bg-warning",
        border: "border-warning"
      };

    default:
      return {
        header: "bg-neutral text-text",
        border: "border-neutral"
      };
  }
});

/* -----------------------
   Action handler
----------------------- */

async function handleAction(action: UIAction) {
  if (!action.onClick) return;

  await action.onClick();
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    leave-active-class="transition duration-150 ease-in"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div v-if="visible" :class="computedUI.root">
      <!-- HEADER -->
      <div v-if="title || $slots.title" class="p-1">
        <div :class="twMerge(computedUI.header, colorStyles.header)">
          <div :class="computedUI.icon">
            <slot name="icon">
              <Icon v-if="icon" :name="icon" />
            </slot>

            <slot name="title">
              {{ title }}
            </slot>
          </div>

          <Icon
            v-if="close"
            name="lucide:x"
            :class="computedUI.close"
            @click="closeAlert"
          />
        </div>
      </div>

      <!-- BODY -->
      <div v-if="description || $slots.default" class="p-1 pt-0">
        <div :class="twMerge(computedUI.body, colorStyles.border)">
          <slot>
            {{ description }}
          </slot>
        </div>
      </div>

      <!-- ACTIONS -->
      <div v-if="actions.length || $slots.actions" :class="computedUI.footer">
        <slot name="actions">
          <Button
            v-for="(action, i) in actions"
            :key="i"
            v-bind="action"
            @click="handleAction(action)"
          />
        </slot>
      </div>
    </div>
  </Transition>
</template>
