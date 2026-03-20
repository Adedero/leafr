<script setup lang="ts">
interface Props {
  width?: string | number;
  height?: string | number;
  color?: string;
}

const {
  width = 90,
  height = 54,
  color = "var(--color-accent)"
} = defineProps<Props>();

const DEFAULT_WIDTH = 90;
const DEFAULT_HEIGHT = 54;
const RATIO = DEFAULT_WIDTH / DEFAULT_HEIGHT;

const size = computed(() => {
  let w: string | number = width;
  let h: string | number = height;

  if (typeof width === "number" && typeof height !== "number") {
    h = Numerics.round(width / RATIO);
  } else if (typeof height === "number" && typeof width !== "number") {
    w = Numerics.round(height * RATIO);
  }

  return { width: w, height: h };
});
</script>

<template>
  <svg
    :width="size.width"
    :height="size.height"
    viewBox="0 0 90 54"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M57 12.1352C43.8 23.3352 39.8333 41.8019 39.5 49.6352C80.3 46.4352 89.5 15.3019 89 0.135208C83.8333 -0.531459 70.2 0.935208 57 12.1352Z"
      :fill="color"
    />
    <path
      d="M20.7309 24.5996C19.7911 35.9035 26.4958 46.2874 29.9656 50.0664C47.407 29.6638 37.2687 10.9921 30.0194 4.20657C27.3147 6.29428 21.6706 13.2957 20.7309 24.5996Z"
      :fill="color"
    />
    <path
      d="M5.62322 45.007C10.8131 51.138 19.3702 52.9804 23 53.1352C21.5172 34.1849 7.09059 29.9118 0.0626527 30.144C-0.246268 32.5438 0.433358 38.876 5.62322 45.007Z"
      :fill="color"
    />
  </svg>
</template>
