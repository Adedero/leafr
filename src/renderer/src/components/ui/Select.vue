<script setup lang="ts">
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
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport
} from "reka-ui";

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
  searchPlaceholder = undefined
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
      class="inline-flex justify-between items-center gap-2 bg-surface hover:bg-muted/10 disabled:opacity-60 px-4 py-2.5 border-2 border-border focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface min-w-[180px] max-w-full text-text transition-colors duration-150 disabled:cursor-not-allowed"
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
        <!-- <SelectScrollUpButton
          class="flex justify-center items-center bg-surface/80 hover:bg-muted/20 h-8 text-muted transition-colors"
        >
          <Icon name="lucide:chevron-up" size="16" />
        </SelectScrollUpButton> -->

        <SelectViewport class="relative p-1 max-h-96">
          <div v-if="search" class="top-0 z-10 sticky bg-surface p-2 w-full">
            <InputText size="sm" :placeholder="searchPlaceholder" />
          </div>
          <!-- Case 1: Flat array of primitives or objects -->
          <template
            v-if="
              Array.isArray(items) &&
              items.length &&
              !Array.isArray(items[0]) &&
              !('label' in items[0])
            "
          >
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

          <!-- Case 2: Array of arrays (simple groups with separators) -->
          <template
            v-else-if="
              Array.isArray(items) && items.length && Array.isArray(items[0])
            "
          >
            <template
              v-for="(group, idx) in items as AcceptedValue[][]"
              :key="idx"
            >
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

          <!-- Case 3: Array of { label, items } -->
          <template
            v-else-if="
              Array.isArray(items) &&
              items.length &&
              typeof items[0] === 'object' &&
              'label' in items[0]
            "
          >
            <template v-for="(group, idx) in items as GroupItem[]" :key="idx">
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

          <!-- Fallback: nothing matches or empty -->
          <div v-else class="px-4 py-6 text-muted text-sm text-center">
            No options available
          </div>
        </SelectViewport>

        <!-- <SelectScrollDownButton
          class="flex justify-center items-center bg-surface/80 hover:bg-muted/20 h-8 text-muted transition-colors"
        >
          <Icon name="lucide:chevron-down" size="16" />
        </SelectScrollDownButton> -->
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
