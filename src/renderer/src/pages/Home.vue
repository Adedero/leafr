<script setup lang="ts">
import useSWRV from "swrv";

const toast = useToast();
const { open } = useBook();
const { debounced } = useBooksSearch();
const { data, error, isLoading, mutate } = useSWRV("books:all", getAllBooks);

async function getAllBooks() {
  return await window.api.books.getAll();
}

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

const { isLoading: isSyncing, executeImmediate: syncBooks } = useAsyncState(
  async () => {
    try {
      await window.api.books.sync();
      mutate();
      toast.open({
        title: "Done",
        description: "Books synced successfully"
      });
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
    <div v-if="!debounced && recents.length > 0" class="space-y-4">
      <h2 class="font-bold text-xl">Recents</h2>
      <div class="gap-5 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        <BookListItem v-for="book in recents" :key="book.id" :book="book" @select="open(book.id)" />
      </div>
    </div>

    <div class="space-y-2">
      <header class="top-0 z-10 sticky flex justify-between items-center gap-2 bg-background py-2">
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
          <BookListItem v-for="book in books" :key="book.id" :book="book" @select="open(book.id)" />
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
            <Button color="neutral" variant="outline" icon="lucide:plus"> Open </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
