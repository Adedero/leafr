<script setup lang="ts">
import type { NavItem } from "epubjs";
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger
} from "reka-ui";

interface Props {
  toc: NavItem[];
}

const { toc } = defineProps<Props>();
const emit = defineEmits<{
  select: [item: NavItem];
}>();
</script>

<template>
  <div>
    <ul class="divide-y divide-border/20">
      <li v-for="item in toc" :key="item.id" class="select-none">
        <CollapsibleRoot
          v-if="item.subitems?.length"
          class="flex flex-wrap hover:bg-primary/10"
        >
          <button
            class="py-3 px-2 cursor-context-menu grow text-left"
            @click="emit('select', item)"
          >
            {{ item.label }}
          </button>

          <CollapsibleTrigger>
            <Button
              color="neutral"
              variant="ghost"
              icon="lucide:chevron-down"
              class="h-full w-10"
            />
          </CollapsibleTrigger>

          <CollapsibleContent
            class="CollapsibleContent w-full data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
          >
            <BookToc :toc="item.subitems" @select="emit('select', $event)" />
          </CollapsibleContent>
        </CollapsibleRoot>

        <button
          v-else
          class="py-3 px-2 hover:bg-primary/10 cursor-context-menu w-full text-left"
          :class="item.parent ? 'pl-10' : ''"
          @click="emit('select', item)"
        >
          {{ item.label }}
        </button>
      </li>
    </ul>
  </div>
</template>
