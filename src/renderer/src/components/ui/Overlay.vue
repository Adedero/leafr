<script setup lang="ts">
import { OVERLAY_WRAPPER_ID } from "@renderer/constants/ui";
import { twMerge } from "tailwind-merge";
import { computed, useAttrs } from "vue";

interface OverlayProps {
  transparent?: boolean;
  open?: boolean;
}

const { open = false, transparent = false } = defineProps<OverlayProps>();

const attrs = useAttrs();

const overlayClass = computed(() =>
  twMerge(
    "w-full h-full",
    " flex items-center justify-center",
    transparent ? "bg-transparent" : "bg-black/40 backdrop-blur-xs",
    typeof attrs.class === "string" ? attrs.class : ""
  )
);
</script>

<template>
  <div>
    <Teleport :to="`#${OVERLAY_WRAPPER_ID}`">
      <Transition
        enter-active-class="transition duration-200 ease-in-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in-out"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="open" class="h-screen w-screen fixed inset-0 z-100">
          <!-- Overlay -->
          <div :class="overlayClass" v-bind="attrs">
            <slot />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
