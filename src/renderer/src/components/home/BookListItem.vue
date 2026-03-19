<script setup lang="ts">
import { assetUrl } from "@renderer/utils/asset-url";
import { Numerics } from "@renderer/utils/numerics";
import type { GetAllBooksReturn } from "src/main/handlers/books/get-all-books";

type Book = GetAllBooksReturn[number];
const { book } = defineProps<{
  book: Book;
}>();

defineEmits<{
  select: [];
}>();

const allowCheck = computed(
  () => !!getCurrentInstance()?.vnode?.props?.onSelect
);
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
            :src="assetUrl(book.coverImagePath)"
          />
          <div
            v-else
            class="flex justify-center items-center bg-surface w-full h-full text-muted"
          >
            <Logo color="currentcolor" />
          </div>
        </div>
      </div>

      <div>
        <div class="flex items-center gap-1">
          <h3 class="font-semibold">
            {{ book.title }}
          </h3>
          <p
            v-if="book.readingProgress"
            class="font-medium text-primary text-sm"
          >
            {{ Numerics.round(book.readingProgress.percentage * 100, 1) }}%
          </p>
        </div>
        <p class="text-muted text-sm">
          {{ book.author }}
        </p>
      </div>
    </div>
  </div>
</template>
