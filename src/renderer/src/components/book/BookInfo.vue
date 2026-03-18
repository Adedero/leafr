<script setup lang="ts">
import assetURL from "@renderer/utils/asset-url";
import { useDateFormat } from "@vueuse/core";
import type { FullBook } from "src/main/database/schema";

interface Props {
  book?: FullBook | null;
}

const { book } = defineProps<Props>();
</script>

<template>
  <div v-if="book" class="flex flex-col justify-center items-center gap-2">
    <div class="relative p-1 border-2 border-border">
      <div class="h-80 overflow-hidden cursor-pointer">
        <img
          v-if="book.coverImagePath"
          :src="assetURL(book.coverImagePath)"
          class="h-full object-cover"
        />
        <div v-else class="flex justify-center items-center bg-surface w-full h-full text-muted">
          <Logo color="currentcolor" />
        </div>
      </div>
    </div>

    <div class="text-center">
      <p class="font-semibold">{{ book.title }}</p>
      <p class="text-muted text-sm">{{ book.author }}</p>
    </div>

    <Separator v-if="book.description" class="my-2" />

    <div v-if="book.description" v-html="book.description" class="text-sm" />

    <Separator class="my-2" />

    <div class="gap-y-4 grid grid-cols-2 w-full text-sm">
      <div>
        <p>Title</p>
        <p v-if="book.title" class="font-semibold">{{ book.title }}</p>
        <p v-else class="font-semibold">N/A</p>
      </div>

      <div>
        <p>Author</p>
        <p v-if="book.author" class="font-semibold">{{ book.author }}</p>
        <p v-else class="font-semibold">N/A</p>
      </div>

      <div>
        <p>Publisher</p>
        <p v-if="book.publisher" class="font-semibold">{{ book.publisher }}</p>
        <p v-else class="font-semibold">N/A</p>
      </div>

      <div>
        <p>Publish Date</p>
        <p v-if="book.publishedDate" class="font-semibold">
          {{ useDateFormat(book.publishedDate, "DD MMM, YYYY") }}
        </p>
        <p v-else class="font-semibold">N/A</p>
      </div>
    </div>
  </div>
</template>
