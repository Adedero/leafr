<script setup lang="ts">
import useSWRV from "swrv";

const { getAllLabels } = useLabelUtils();
const { debounced } = useBooksSearch();
// const { openAndNavigate } = useBookUtils();

const { data, error, isLoading, mutate } = useSWRV("labels:all", getAllLabels);
</script>

<template>
  <div class="space-y-2 px-4 py-6">
    <header
      class="top-0 z-10 sticky flex justify-between items-center gap-2 bg-background py-2"
    >
      <h2 class="font-bold text-xl">
        Labels <span v-if="data">({{ data.groups }})</span>
      </h2>
      <div class="flex items-center gap-2">
        <!-- <Select
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
        </Button> -->
      </div>
    </header>

    <div
      v-if="isLoading"
      class="flex flex-col justify-center items-center gap-2"
    >
      <Spinner label="Loading your books..." />
    </div>

    <ErrorAlert v-else-if="error" :error @retry="mutate" />

    <div v-else-if="data">
      <div class="gap-5 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
        <!-- <BookListItem
          v-for="book in books"
          :key="book.id"
          :book="book"
          @select="openAndNavigate(book.id)"
        /> -->
      </div>

      <div>
        <div v-if="debounced.length > 0">
          No labels found for <b>"{{ debounced }}"</b>
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
</template>
