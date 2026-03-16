<script setup lang="ts">
import { UIColor, UISize, UIVariant } from "@renderer/types/ui.type";
import { twMerge } from "tailwind-merge";
import { computed, useAttrs, useSlots } from "vue";
import Icon, { IconProps } from "./Icon.vue";

type ButtonUIIcon = IconProps["name"];

interface ButtonUI {
  root: string;
  label: string;
  icon: string;
  trailingIcon: string;
}

export interface ButtonProps {
  color?: UIColor;
  variant?: UIVariant;
  size?: UISize;
  label?: string;
  loading?: boolean;
  loadingAuto?: boolean;
  icon?: ButtonUIIcon;
  trailingIcon?: ButtonUIIcon;
  disabled?: boolean;
  ui?: Partial<ButtonUI>;
  block?: boolean;
}

const {
  color = "primary",
  variant = "filled",
  size = "md",
  label = undefined,
  loading = false,
  icon = undefined,
  trailingIcon = undefined,
  disabled = false,
  ui = {},
  block = false
} = defineProps<ButtonProps>();

const slots = useSlots();
const attrs = useAttrs();

// ─── Computed state ────────────────────────────────────────────────────────
const isLoading = computed(() => loading);
const isDisabled = computed(() => disabled || isLoading.value);

// ─── Size classes ──────────────────────────────────────────────────────────
const sizeClasses: Record<UISize, string> = {
  sm: slots.default || label ? "h-7 px-2.5 text-xs gap-1.5" : "h-7 aspect-square",
  md: slots.default || label ? "h-9 px-3.5 text-sm gap-2" : "h-9 aspect-square",
  lg: slots.default || label ? "h-11 px-4 text-base gap-2" : "h-11 aspect-square",
  xl: slots.default || label ? "h-13 px-5 text-lg gap-2.5" : "h-13 aspect-square"
};

const iconSizeClasses: Record<UISize, string> = {
  sm: "text-sm",
  md: "text-md",
  lg: "text-lg",
  xl: "text-xl"
};

// ─── Color × Variant matrix ────────────────────────────────────────────────

type ColorVariantKey = `${UIColor}-${UIVariant}`;

const colorVariantClasses: Partial<Record<ColorVariantKey, string>> = {
  "primary-filled": "bg-accent text-background hover:bg-accent/85 active:bg-accent/70",
  "primary-outline": "border-accent text-accent hover:bg-accent/10 active:bg-accent/20",
  "primary-soft": "bg-accent/15 text-accent hover:bg-accent/25 active:bg-accent/35",
  "primary-subtle": "border-accent bg-accent/20 text-accent hover:bg-accent/10 active:bg-accent/20",
  "primary-ghost": "text-accent hover:bg-accent/10 active:bg-accent/20",
  "primary-link": "text-accent underline-offset-4 hover:underline p-0 h-auto",

  "secondary-filled": "bg-secondary text-background hover:bg-secondary/85 active:bg-secondary/70",
  "secondary-outline":
    "border-secondary text-secondary hover:bg-secondary/10 active:bg-secondary/20",
  "secondary-soft": "bg-secondary/15 text-secondary hover:bg-secondary/25 active:bg-secondary/35",
  "secondary-subtle":
    "border-secondary bg-secondary/20 text-secondary hover:bg-secondary/10 active:bg-secondary/20",
  "secondary-ghost": "text-secondary hover:bg-secondary/10 active:bg-secondary/20",
  "secondary-link": "text-secondary underline-offset-4 hover:underline p-0 h-auto",

  "warning-filled": "bg-warning text-background hover:bg-warning/85 active:bg-warning/70",
  "warning-outline": "border-warning text-warning hover:bg-warning/10 active:bg-warning/20",
  "warning-soft": "bg-warning/15 text-warning hover:bg-warning/25 active:bg-warning/35",
  "warning-subtle":
    "border-warning bg-warning/20 text-warning hover:bg-warning/10 active:bg-warning/20",
  "warning-ghost": "text-warning hover:bg-warning/10 active:bg-warning/20",
  "warning-link": "text-warning underline-offset-4 hover:underline p-0 h-auto",

  "error-filled": "bg-error text-background hover:bg-error/85 active:bg-error/70",
  "error-outline": "border-error text-error hover:bg-error/10 active:bg-error/20",
  "error-soft": "bg-error/15 text-error hover:bg-error/25 active:bg-error/35",
  "error-subtle": "border-error bg-error/20 text-error hover:bg-error/10 active:bg-error/20",
  "error-ghost": "text-error hover:bg-error/10 active:bg-error/20",
  "error-link": "text-error underline-offset-4 hover:underline p-0 h-auto",

  "neutral-filled": "bg-text text-background hover:bg-text/85 active:bg-text/70",
  "neutral-outline": "border-border text-text hover:bg-text/10 active:bg-text/15",
  "neutral-soft": "bg-text/10 text-text hover:bg-text/15 active:bg-text/20",
  "neutral-subtle": "border-border bg-text/20 text-text hover:bg-text/10 active:bg-text/15",
  "neutral-ghost": "text-muted hover:text-text hover:bg-text/10 active:bg-text/15",
  "neutral-link": "text-text underline-offset-4 hover:underline p-0 h-auto"
};

const rootClasses = computed(() => {
  const key: ColorVariantKey = `${color}-${variant}`;
  const cv = colorVariantClasses[key] ?? "";
  const computedSize = variant === "link" ? "" : sizeClasses[size];

  return [
    "inline-flex items-center justify-center font-ui font-medium",
    "transition-all duration-150 cursor-pointer select-none",
    "border-2 border-transparent",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    block ? "w-full" : "",
    computedSize,
    cv,
    isDisabled.value ? "opacity-50 pointer-events-none cursor-not-allowed" : ""
  ];
});
</script>

<template>
  <button
    :class="
      twMerge(rootClasses.join(' '), ui?.root, typeof attrs.class === 'string' ? attrs.class : '')
    "
    :disabled="isDisabled"
  >
    <!-- Loading spinner (replaces leading icon when loading) -->
    <span v-if="isLoading" :class="twMerge('shrink-0', iconSizeClasses[size], ui?.icon)">
      <Icon name="lucide:loader-circle" class="animate-spin" />
    </span>

    <!-- Leading icon: slot > prop -->
    <span v-else-if="slots.icon || icon" :class="twMerge(iconSizeClasses[size], ui?.icon)">
      <slot name="icon">
        <Icon v-if="icon" :name="icon" />
      </slot>
    </span>

    <!-- Label: slot > prop -->
    <span v-if="slots.default || label" :class="twMerge('leading-none', ui?.label)">
      <slot>
        <slot>{{ label }}</slot>
      </slot>
    </span>

    <!-- Trailing icon: slot > prop -->
    <span
      v-if="(slots.trailingIcon || trailingIcon) && !isLoading"
      :class="twMerge(iconSizeClasses[size], ui?.trailingIcon)"
    >
      <slot name="trailing-icon">
        <Icon v-if="trailingIcon" :name="trailingIcon" />
      </slot>
    </span>
  </button>
</template>
