<script setup lang="ts">
import type { IconName } from "./Icon.vue";
import Icon from "./Icon.vue";
import type { UISize } from "@renderer/types/ui.type";
import { twMerge } from "tailwind-merge";

const emit = defineEmits<{
  focus: [e: FocusEvent];
  blur: [e: FocusEvent];
}>();

export interface InputTextUI {
  root: string;
  input: string;
  icon: string;
  trailingIcon: string;
}

export interface InputTextProps {
  placeholder?: string;
  size?: UISize;
  variant?: "filled" | "outline" | "subtle";
  icon?: IconName;
  trailingIcon?: IconName;
  loading?: boolean;
  ui?: Partial<InputTextUI>;
  disabled?: boolean;
  readonly?: boolean;
}

const {
  placeholder = undefined,
  size = "md",
  variant = "outline",
  icon = undefined,
  trailingIcon = undefined,
  loading = false,
  ui = {},
  disabled = false,
  readonly = false
} = defineProps<InputTextProps>();

const slots = useSlots();
const attrs = useAttrs();
const inputRef = useTemplateRef("inputRef");

defineExpose({
  inputRef
});

const modelValue = defineModel<string>();

/* -----------------------
   UI defaults
----------------------- */

const defaultUI: InputTextUI = {
  root: "relative flex items-center w-fit",
  input:
    "w-full outline-none bg-transparent placeholder:text-muted disabled:cursor-not-allowed",
  icon: "absolute left-3 flex items-center pointer-events-none",
  trailingIcon: "absolute right-3 flex items-center pointer-events-none"
};

const computedUI = computed(() => ({
  root: twMerge(defaultUI.root, ui?.root ?? ""),
  input: twMerge(defaultUI.input, ui?.input ?? ""),
  icon: twMerge(defaultUI.icon, ui?.icon ?? ""),
  trailingIcon: twMerge(defaultUI.trailingIcon, ui?.trailingIcon ?? "")
}));

/* -----------------------
   Size styles
----------------------- */

const sizeStyles = computed(() => {
  switch (size) {
    case "sm":
      return {
        input: "text-sm py-1.5 px-3",
        icon: "w-4 h-4"
      };

    case "lg":
      return {
        input: "text-lg py-3 px-4",
        icon: "w-6 h-6"
      };

    default:
      return {
        input: "text-base py-2 px-3",
        icon: "w-5 h-5"
      };
  }
});

/* -----------------------
   Variant styles
----------------------- */

const variantStyles = computed(() => {
  switch (variant) {
    case "filled":
      return "bg-gray-100 focus-within:bg-gray-200";

    case "subtle":
      return "bg-transparent border-b border-gray-300 focus-within:border-gray-500";

    default:
      return "border-2 border-border bg-surface focus-within:border-primary";
  }
});

/* -----------------------
   Icon padding adjustments
----------------------- */

const inputPadding = computed(() => {
  let left = "";
  let right = "";

  if (icon || slots.leading) left = "pl-9";
  if (trailingIcon || loading || slots.trailing) right = "pr-9";

  return `${left} ${right}`;
});
</script>

<template>
  <div :class="twMerge(variantStyles, computedUI.root)">
    <!-- Leading slot or icon -->
    <span
      v-if="icon || $slots.leading"
      :class="twMerge(sizeStyles.icon, computedUI.icon)"
    >
      <slot name="leading">
        <Icon :name="icon!" />
      </slot>
    </span>

    <!-- Input -->
    <input
      ref="inputRef"
      v-bind="attrs"
      v-model="modelValue"
      :placeholder="placeholder"
      :disabled="disabled || loading"
      :readonly="readonly"
      :class="twMerge(sizeStyles.input, inputPadding, computedUI.input)"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
    />

    <!-- Loading spinner -->
    <span
      v-if="loading"
      :class="twMerge(computedUI.trailingIcon, sizeStyles.icon, 'animate-spin')"
    >
      <Icon name="lucide:loader-circle" />
    </span>

    <!-- Trailing icon / slot -->
    <span
      v-else-if="trailingIcon || $slots.trailing"
      :class="twMerge(computedUI.trailingIcon, sizeStyles.icon)"
    >
      <slot name="trailing">
        <Icon :name="trailingIcon!" />
      </slot>
    </span>
  </div>
</template>
