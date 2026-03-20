<script setup lang="ts">
import useSWRV from "swrv";

const toast = useToast();
const { getAllBooks, openAndNavigate, syncBooks } = useBookUtils();
const { debounced } = useBooksSearch();
const uiStore = useUiStore();

const { data, error, isLoading, mutate } = useSWRV("books:all", getAllBooks);

const selectItems = [
  { label: "Name (asc)", value: "name:asc" },
  { label: "Name (desc)", value: "name:desc" },
  { label: "Author (asc)", value: "author:asc" },
  { label: "Author (desc)", value: "author:desc" },
  { label: "Date added (asc)", value: "dateAdded:asc" },
  { label: "Date added (desc)", value: "dateAdded:desc" },
  { label: "Last opened (asc)", value: "lastOpened:asc" },
  { label: "Last opened (desc)", value: "lastOpened:desc" },
  { label: "Reading progress (asc)", value: "readingProgress:asc" },
  { label: "Reading progress (desc)", value: "readingProgress:desc" }
];

function sortByValues(arr: (typeof data)["value"], value: string) {
  if (!arr) return undefined;

  const [field, order] = value.split(":") as [string, "asc" | "desc"];
  const dir = order === "asc" ? 1 : -1;

  return [...arr].sort((a, b) => {
    let valA: string | number | null | undefined;
    let valB: string | number | null | undefined;

    switch (field) {
      case "name":
        valA = a.title;
        valB = b.title;
        break;
      case "author":
        valA = a.author;
        valB = b.author;
        break;
      case "dateAdded":
        valA = a.addedAt;
        valB = b.addedAt;
        break;
      case "lastOpened":
        valA = a.lastOpenedAt;
        valB = b.lastOpenedAt;
        break;
      case "readingProgress":
        valA = a.readingProgress?.percentage ?? -1;
        valB = b.readingProgress?.percentage ?? -1;
        break;
      default:
        return 0;
    }

    // nulls always go to the end regardless of sort direction
    if (valA == null && valB == null) return 0;
    if (valA == null) return 1;
    if (valB == null) return -1;

    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * dir;
    }

    return String(valA).localeCompare(String(valB)) * dir;
  });
}

const books = computed(() => {
  return sortByValues(
    data.value?.filter((book) => {
      const value = debounced.value.toLowerCase();
      return (
        book.title.toLowerCase().includes(value) ||
        (book.author && book.author.toLowerCase().includes(value))
      );
    }),
    uiStore.homePageBooksSort
  );
});

const recents = computed(() => {
  if (!data.value) return [];
  const filtered = data.value.filter((book) => book.lastOpenedAt);
  if (!filtered.length) return [];
  return [...filtered]
    .sort(
      (a, b) =>
        new Date(b.lastOpenedAt!).getTime() -
        new Date(a.lastOpenedAt!).getTime()
    )
    .slice(0, 5);
});

const { isLoading: isSyncing, executeImmediate: execSyncBooks } = useAsyncState(
  handleSync,
  null,
  { immediate: false }
);

async function handleSync() {
  try {
    await syncBooks();
    mutate();
    toast.open({
      title: "Done",
      description: "Books synced successfully"
    });
  } catch (error) {
    toast.error("Error", toError(error).message);
  }
}
</script>

<template>
  <div class="space-y-16 px-4 py-6">
    <div v-if="!debounced && recents.length > 0" class="space-y-4">
      <h2 class="font-bold text-xl">Recents</h2>
      <div class="gap-5 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        <BookListItem
          v-for="book in recents"
          :key="book.id"
          :book="book"
          @select="openAndNavigate(book.id)"
        />
      </div>
    </div>

    <div class="space-y-2">
      <header
        class="top-0 z-10 sticky flex justify-between items-center gap-2 bg-background py-2"
      >
        <h2 class="font-bold text-xl">
          All <span v-if="books">({{ books.length }})</span>
        </h2>
        <div class="flex items-center gap-2">
          <Select
            v-model="uiStore.homePageBooksSort"
            :items="selectItems"
            size="sm"
          />

          <Button
            color="neutral"
            variant="outline"
            icon="lucide:refresh-ccw"
            :loading="isSyncing"
            @click="execSyncBooks"
          >
            Sync
          </Button>
        </div>
      </header>

      <div
        v-if="isLoading"
        class="flex flex-col justify-center items-center gap-2"
      >
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
            @select="openAndNavigate(book.id)"
          />
        </div>

        <div v-else>
          <div v-if="debounced.length > 0">
            No books found for <b>"{{ debounced }}"</b>
          </div>

          <div
            v-else
            class="flex flex-col justify-center items-center gap-2 text-center"
          >
            <div>
              <p>No books yet.</p>
              <p>Why don't you open one to get started?</p>
            </div>
            <Button color="neutral" variant="outline" icon="lucide:plus">
              Open
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
