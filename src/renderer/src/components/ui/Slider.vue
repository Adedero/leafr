<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "reka-ui";

interface Props {
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  defaultValue?: number[];
  name?: string;
  dir?: "ltr" | "rtl";
  orientation?: "vertical" | "horizontal";
  thumbAlignment?: "contain" | "overflow";
  disabled?: boolean;
  required?: boolean;
}

const props = defineProps<Props>();
const modelValue = defineModel<number[]>({ default: () => [0] });
const isSliding = ref(false);
</script>

<template>
  <SliderRoot
    v-model="modelValue"
    v-bind="props"
    class="relative flex items-center h-5 touch-none select-none SliderRoot"
    @pointerdown="isSliding = true"
    @pointerup="isSliding = false"
    @pointerleave="isSliding = false"
  >
    <SliderTrack class="relative bg-muted/50 rounded-full h-2 SliderTrack grow">
      <SliderRange
        class="absolute bg-secondary rounded-full h-full SliderRange"
      />
    </SliderTrack>
    <SliderThumb
      class="block relative bg-primary shadow-sm focus:shadow-[0_0_0_2px] focus:shadow-primary/50 rounded-full focus:outline-none w-6 h-6 SliderThumb"
      aria-label="Volume"
    >
      <Transition name="tooltip">
        <div
          v-if="$slots.tooltip && isSliding"
          class="-top-10 left-1/2 absolute bg-surface p-1 border-2 border-border whitespace-nowrap -translate-x-1/2 pointer-events-none"
        >
          <slot name="tooltip" :value="modelValue[0]" />
        </div>
      </Transition>
    </SliderThumb>
  </SliderRoot>
</template>

<style scoped>
.SliderRoot[data-orientation="vertical"] {
  flex-direction: column;
  width: 1.25rem;
}

.SliderTrack[data-orientation="vertical"] {
  width: 3px;
}

.SliderRange[data-orientation="vertical"] {
  width: 100%;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition:
    opacity 80ms ease,
    transform 80ms ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
