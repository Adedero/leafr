<script setup lang="ts">
import Button from "@renderer/components/ui/Button.vue";
import Spinner from "@renderer/components/ui/Spinner.vue";
import useBooksSearch from "@renderer/hooks/use-books-search";
import useSWRV from "swrv";
import { computed, ref } from "vue";
import ErrorAlert from "@renderer/components/global/ErrorAlert.vue";
import BookListItem from "@renderer/components/home/BookListItem.vue";
import { Book } from "src/main/database/schema";
import Modal from "@renderer/components/ui/Modal.vue";
import BookListItemData from "@renderer/components/home/BookListItemData.vue";
import { useAsyncState } from "@vueuse/core";
import useToast from "@renderer/hooks/use-toast";
import { toError } from "@renderer/utils/to-error";

const toast = useToast();
const { debounced } = useBooksSearch();
const { data, error, isLoading, mutate } = useSWRV("books:all", getAllBooks);

async function getAllBooks() {
  return await window.api.books.getAll();
}

type TBook = Book & { checked?: boolean };
const books = computed(() => {
  if (!data.value) {
    return null;
  }
  return data.value.filter((book) => {
    const value = debounced.value.toLowerCase();
    return (
      book.title.toLowerCase().includes(value) ||
      (book.author && book.author.toLowerCase().includes(value))
    );
  });
});

const recents = computed(() => {
  if (!data.value) return [];
  const filtered = data.value.filter((book) => book.lastOpenedAt);
  if (!filtered.length) return [];
  return [...filtered]
    .sort((a, b) => new Date(b.lastOpenedAt!).getTime() - new Date(a.lastOpenedAt!).getTime())
    .slice(0, 5);
});

const open = ref(false);
const selectedBook = ref<TBook | null>(null);

function showBookDetails(book: TBook) {
  selectedBook.value = book;
  open.value = true;
}

function onModalClose() {
  open.value = false;
  selectedBook.value = null;
}

const { isLoading: isSyncing, executeImmediate: syncBooks } = useAsyncState(
  async () => {
    try {
      await window.api.books.sync();
      mutate();
    } catch (error) {
      toast.error("Error", toError(error).message);
    }
  },
  null,
  { immediate: false }
);
</script>

<template>
  <div class="space-y-16 px-4 py-6">
    <div v-if="recents.length > 0" class="space-y-4">
      <h2 class="font-bold text-xl bg-error">Recents</h2>
      <div class="gap-5 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        <BookListItem v-for="book in recents" :key="book.id" :book="book" />
      </div>
    </div>

    <div class="space-y-2">
      <header class="z-10 top-0 sticky flex justify-between items-center gap-2 bg-background py-2">
        <h2 class="font-bold text-xl">
          All <span v-if="books">({{ books.length }})</span>
        </h2>
        <div class="flex items-center gap-2">
          <Button
            color="neutral"
            variant="outline"
            icon="lucide:refresh-ccw"
            :loading="isSyncing"
            @click="syncBooks"
          >
            Sync
          </Button>
        </div>
      </header>

      <div v-if="isLoading" class="flex flex-col justify-center items-center gap-2">
        <Spinner label="Loading your books..." />
      </div>

      <ErrorAlert v-else-if="error" :error @retry="mutate" />

      <div v-else-if="books">
        <div
          v-if="books.length > 0"
          class="gap-5 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))]"
        >
          <BookListItem
            v-for="book in books"
            :key="book.id"
            :book="book"
            @select="showBookDetails(book)"
          />
        </div>

        <div v-else>
          <div v-if="debounced.length > 0">
            No books found for <b>"{{ debounced }}"</b>
          </div>

          <div v-else class="flex flex-col justify-center items-center gap-2 text-center">
            <div>
              <p>No books yet.</p>
              <p>Why don't you open one to get started?</p>
            </div>
            <Button color="neutral" variant="outline" icon="lucide:plus">Open</Button>
          </div>
        </div>
      </div>

      <Modal
        v-model:open="open"
        :title="selectedBook?.title || ''"
        :description="selectedBook?.author || ''"
        show-full-screen-icon
        @close="onModalClose"
      >
        <template #body>
          <BookListItemData :book="selectedBook!" />
        </template>
      </Modal>
    </div>
  </div>
</template>
