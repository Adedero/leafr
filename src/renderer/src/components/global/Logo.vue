<script setup lang="ts">
interface Props {
  width?: string | number;
  height?: string | number;
  colorCircle?: string;
  colorLeaves?: string;
}

const {
  width = 40,
  height = 40,
  colorCircle = "var(--color-primary)",
  colorLeaves = "var(--color-background)"
  } = defineProps<Props>();

const DEFAULT_WIDTH = 40;
const DEFAULT_HEIGHT = 40;
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
    viewBox="0 0 61 61"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M30.0117 60.2185C46.5867 60.2185 60.0234 46.7818 60.0234 30.2068C60.0234 13.6318 46.5867 0.195129 30.0117 0.195129C13.4367 0.195129 0 13.6318 0 30.2068C0 46.7818 13.4367 60.2185 30.0117 60.2185Z"
      :fill="colorCircle"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M29.0207 7.70572V25.1868C22.9476 13.7971 15.0066 16.6611 29.0207 7.70572Z"
      :fill="colorLeaves"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M29.0777 28.6494L29.0287 39.8287C29.0287 39.8287 27.6 34.5099 21.5919 30.3727C15.5839 26.2356 12.7761 28.0582 14.8451 23.0835C16.9133 18.1096 17.5535 9.98294 29.0784 28.6487L29.0777 28.6494Z"
      :fill="colorLeaves"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M29.009 52.7086C29.009 52.7086 18.0752 47.685 14.9232 38.7216C13.7927 35.5052 10.7649 25.9717 17.9276 30.4962C22.6063 33.4516 29.0419 36.7016 29.009 52.7086Z"
      :fill="colorLeaves"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M31.002 7.70572V25.1868C37.075 13.7971 45.0161 16.6611 31.002 7.70572Z"
      :fill="colorLeaves"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M30.9449 28.6494L30.9939 39.8287C30.9939 39.8287 32.4227 34.5099 38.4307 30.3727C44.4387 26.2356 47.2465 28.0582 45.1776 23.0835C43.1094 18.1096 42.4692 9.98294 30.9442 28.6487L30.9449 28.6494Z"
      :fill="colorLeaves"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M31.0137 52.7086C31.0137 52.7086 41.9474 47.685 45.0994 38.7216C46.23 35.5052 49.2578 25.9717 42.095 30.4962C37.4164 33.4516 30.9808 36.7016 31.0137 52.7086Z"
      :fill="colorLeaves"
    />
  </svg>
</template>

<!-- <template>
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
</template> -->
