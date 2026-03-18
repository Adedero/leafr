<script setup lang="ts">
import { LOADING_MESSAGES } from "@renderer/constants/loading-messages";

const {
  label = undefined,
  size = 80,
  showRandomLabels = false
} = defineProps<{
  label?: string;
  size?: number;
  showRandomLabels?: boolean;
}>();

const { current, start, stop } = useLoop(LOADING_MESSAGES, { mode: "random", immediate: false });
watch(
  () => showRandomLabels,
  (val) => (val ? start() : stop()),
  { immediate: true }
);

// all positions are based on 80px original — scale factor
const scale = computed(() => size / 80);
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-2 w-fit">
    <div
      v-bind="$attrs"
      class="lds-roller"
      :style="{
        '--size': size + 'px',
        '--half': size / 2 + 'px',
        '--scale': scale
      }"
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>

    <div v-if="showRandomLabels || label || $slots.label">
      <slot name="label">
        <p class="font-semibold text-sm text-center">{{ showRandomLabels ? current : label }}</p>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.lds-roller,
.lds-roller div,
.lds-roller div:after {
  box-sizing: border-box;
}

.lds-roller {
  display: inline-block;
  position: relative;
  width: var(--size);
  height: var(--size);
}

.lds-roller div {
  animation: lds-roller 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  transform-origin: var(--half) var(--half);
}

.lds-roller div:after {
  content: " ";
  display: block;
  position: absolute;
  width: calc(7.2px * var(--scale));
  height: calc(7.2px * var(--scale));
  border-radius: 50%;
  background: currentColor;
  margin: calc(-3.6px * var(--scale)) 0 0 calc(-3.6px * var(--scale));
}

.lds-roller div:nth-child(1) {
  animation-delay: -0.036s;
}
.lds-roller div:nth-child(1):after {
  top: calc(62.62742px * var(--scale));
  left: calc(62.62742px * var(--scale));
}

.lds-roller div:nth-child(2) {
  animation-delay: -0.072s;
}
.lds-roller div:nth-child(2):after {
  top: calc(67.71281px * var(--scale));
  left: calc(56px * var(--scale));
}

.lds-roller div:nth-child(3) {
  animation-delay: -0.108s;
}
.lds-roller div:nth-child(3):after {
  top: calc(70.90963px * var(--scale));
  left: calc(48.28221px * var(--scale));
}

.lds-roller div:nth-child(4) {
  animation-delay: -0.144s;
}
.lds-roller div:nth-child(4):after {
  top: calc(72px * var(--scale));
  left: calc(40px * var(--scale));
}

.lds-roller div:nth-child(5) {
  animation-delay: -0.18s;
}
.lds-roller div:nth-child(5):after {
  top: calc(70.90963px * var(--scale));
  left: calc(31.71779px * var(--scale));
}

.lds-roller div:nth-child(6) {
  animation-delay: -0.216s;
}
.lds-roller div:nth-child(6):after {
  top: calc(67.71281px * var(--scale));
  left: calc(24px * var(--scale));
}

.lds-roller div:nth-child(7) {
  animation-delay: -0.252s;
}
.lds-roller div:nth-child(7):after {
  top: calc(62.62742px * var(--scale));
  left: calc(17.37258px * var(--scale));
}

.lds-roller div:nth-child(8) {
  animation-delay: -0.288s;
}
.lds-roller div:nth-child(8):after {
  top: calc(56px * var(--scale));
  left: calc(12.28719px * var(--scale));
}

@keyframes lds-roller {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
