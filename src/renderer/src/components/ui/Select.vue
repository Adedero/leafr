<script setup lang="ts">
import type { UISize } from "@renderer/types/ui.type";
import {
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  // SelectScrollDownButton,
  // SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport
} from "reka-ui";
import { twMerge } from "tailwind-merge";

type AcceptedValue =
  | string
  | number
  | { value: string | number; label: string };

type GroupItem = { label: string; items: AcceptedValue[] };

type SelectItems = AcceptedValue[] | AcceptedValue[][] | GroupItem[];

interface Props {
  items?: SelectItems;
  multiple?: boolean;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  placeholder?: string;
  loading?: boolean;
  search?: boolean;
  searchPlaceholder?: string;
  size?: UISize;
  variant?: "filled" | "outline" | "subtle";
}

const {
  items = [],
  multiple = false,
  disabled = false,
  name = undefined,
  required = false,
  placeholder = undefined,
  loading = false,
  search = false,
  searchPlaceholder = undefined,
  size = "md",
  variant = "outline"
} = defineProps<Props>();

const modelValue =
  defineModel<
    Props["multiple"] extends true
      ? (string | number)[]
      : string | number | undefined
  >();

function getValue(item: AcceptedValue): string | number {
  if (typeof item === "object" && item !== null && "value" in item) {
    return item.value;
  }
  return item as string | number;
}

function getLabel(item: AcceptedValue): string {
  if (typeof item === "object" && item !== null && "label" in item) {
    return item.label;
  }
  return String(item);
}

function isGroupItemArray(items: SelectItems): items is GroupItem[] {
  return (
    items.length > 0 &&
    typeof items[0] === "object" &&
    items[0] !== null &&
    "items" in items[0]
  );
}

function isNestedArray(items: SelectItems): items is AcceptedValue[][] {
  return items.length > 0 && Array.isArray(items[0]);
}

function isFlatArray(items: SelectItems): items is AcceptedValue[] {
  return (
    items.length > 0 &&
    !Array.isArray(items[0]) &&
    !(typeof items[0] === "object" && items[0] !== null && "items" in items[0])
  );
}

const sizeStyles = computed(() => {
  switch (size) {
    case "sm":
      return { input: "text-sm py-1.5 px-3", icon: "w-4 h-4" };
    case "lg":
      return { input: "text-lg py-3 px-4", icon: "w-6 h-6" };
    default:
      return { input: "text-base py-2 px-3", icon: "w-5 h-5" };
  }
});

const variantStyles = computed(() => {
  switch (variant) {
    case "filled":
      return "bg-muted/20 focus:ring-accent focus:ring-offset-surface";
    case "subtle":
      return "bg-transparent border-b border-muted/30 focus:ring-accent focus:ring-offset-surface";
    default:
      return "border-2 border-border bg-surface hover:bg-muted/10 focus:ring-accent focus:ring-offset-surface";
  }
});
</script>

<template>
  <SelectRoot
    v-model="modelValue"
    :multiple
    :name
    :required
    :disabled="disabled || loading"
  >
    <!-- Trigger -->
    <SelectTrigger
      :class="
        twMerge(
          'inline-flex justify-between items-center gap-2 min-w-[180px] max-w-full',
          'disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2',
          'text-text transition-colors duration-150 disabled:cursor-not-allowed',
          sizeStyles.input,
          variantStyles
        )
      "
      v-bind="$attrs"
    >
      <div :class="{ 'flex items-center gap-2': loading }">
        <Icon
          v-if="loading"
          name="lucide:loader-circle"
          class="text-muted animate-spin"
          size="16"
        />
        <SelectValue :placeholder class="font-medium text-sm truncate" />
      </div>
      <SelectIcon class="text-muted" />
    </SelectTrigger>

    <SelectPortal>
      <SelectContent
        class="z-200 bg-surface shadow-xl border-2 border-border overflow-hidden SelectContent"
        position="popper"
        :side-offset="6"
        :align-offset="0"
      >
        <SelectViewport class="relative p-1 max-h-96">
          <div v-if="search" class="top-0 z-10 sticky bg-surface p-2 w-full">
            <InputText size="sm" :placeholder="searchPlaceholder" />
          </div>

          <!-- Case 1: Flat array -->
          <template v-if="isFlatArray(items)">
            <SelectItem
              v-for="item in items"
              :key="getValue(item)"
              :value="getValue(item)"
              class="relative flex items-center data-[state=checked]:bg-accent/5 data-highlighted:bg-accent/10 data-disabled:opacity-50 px-3 py-2.5 rounded outline-none text-text data-[state=checked]:text-accent data-highlighted:text-accent text-sm transition-colors cursor-default data-disabled:pointer-events-none"
            >
              <SelectItemText class="flex-1 truncate">
                {{ getLabel(item) }}
              </SelectItemText>
              <SelectItemIndicator class="ml-auto text-accent">
                <Icon name="lucide:check" size="16" />
              </SelectItemIndicator>
            </SelectItem>
          </template>

          <!-- Case 2: Array of arrays -->
          <template v-else-if="isNestedArray(items)">
            <template v-for="(group, idx) in items" :key="idx">
              <SelectGroup v-if="group.length">
                <SelectItem
                  v-for="item in group"
                  :key="getValue(item)"
                  :value="getValue(item)"
                  class="relative flex items-center data-[state=checked]:bg-accent/5 data-highlighted:bg-accent/10 data-disabled:opacity-50 px-3 py-2.5 rounded outline-none text-text data-[state=checked]:text-accent data-highlighted:text-accent text-sm transition-colors cursor-default data-disabled:pointer-events-none"
                >
                  <SelectItemText class="flex-1 truncate">
                    {{ getLabel(item) }}
                  </SelectItemText>
                  <SelectItemIndicator class="ml-auto text-accent">
                    <Icon name="lucide:check" size="16" />
                  </SelectItemIndicator>
                </SelectItem>
              </SelectGroup>
              <SelectSeparator
                v-if="idx < items.length - 1"
                class="mx-2 my-1 bg-border h-px"
              />
            </template>
          </template>

          <!-- Case 3: GroupItem array -->
          <template v-else-if="isGroupItemArray(items)">
            <template v-for="(group, idx) in items" :key="idx">
              <SelectGroup>
                <SelectLabel
                  class="px-3 py-2 font-semibold text-muted text-xs uppercase tracking-wide"
                >
                  {{ group.label }}
                </SelectLabel>
                <SelectItem
                  v-for="item in group.items"
                  :key="getValue(item)"
                  :value="getValue(item)"
                  class="relative flex items-center data-[state=checked]:bg-accent/5 data-highlighted:bg-accent/10 data-disabled:opacity-50 px-3 py-2.5 rounded outline-none text-text data-[state=checked]:text-accent data-highlighted:text-accent text-sm transition-colors cursor-default data-disabled:pointer-events-none"
                >
                  <SelectItemText class="flex-1 truncate">
                    {{ getLabel(item) }}
                  </SelectItemText>
                  <SelectItemIndicator class="ml-auto text-accent">
                    <Icon name="lucide:check" size="16" />
                  </SelectItemIndicator>
                </SelectItem>
              </SelectGroup>
              <SelectSeparator
                v-if="idx < items.length - 1"
                class="mx-2 my-1 bg-border h-px"
              />
            </template>
          </template>

          <!-- Fallback -->
          <div v-else class="px-4 py-6 text-muted text-sm text-center">
            No options available
          </div>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style>
.SelectContent {
  width: var(--reka-select-trigger-width);
  max-height: var(--reka-select-content-available-height);
}
</style>
