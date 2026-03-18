<script setup lang="ts">
import { Book } from "src/main/database/schema";
import assetURL from "@renderer/utils/asset-url";
import { computed, getCurrentInstance } from "vue";
import Logo from "../global/Logo.vue";

const { book } = defineProps<{
  book: Book;
}>();

defineEmits<{
  select: [];
}>();

const allowCheck = computed(() => !!getCurrentInstance()?.vnode?.props?.onSelect);
</script>

<template>
  <div
    class="group relative p-3"
    :class="{ 'hover:bg-muted/30': allowCheck }"
    @click="$emit('select')"
  >
    <div class="space-y-2">
      <div class="p-1 border-2 border-border">
        <div class="h-60 overflow-hidden">
          <img
            v-if="book.coverImagePath && book.coverImagePath.length > 2"
            :src="assetURL(book.coverImagePath)"
          />
          <div v-else class="flex justify-center items-center bg-surface w-full h-full text-muted">
            <Logo color="currentcolor" />
          </div>
        </div>
      </div>

      <div>
        <h3 class="font-semibold">{{ book.title }}</h3>
        <p class="text-muted text-sm">{{ book.author }}</p>
      </div>
    </div>
  </div>
</template>
