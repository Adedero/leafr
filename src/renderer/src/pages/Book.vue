<script setup lang="ts">
import useSWRV from "swrv";

const route = useRoute();
const { getBook } = useBookUtils();
const { settings } = useBookSettings();
const uiStore = useUiStore();
const { isClicked } = useBooksSearch();

const bookId = computed(() => route.params.bookId.toString());

// reregister event listeners when rendition resizes
const {
  data,
  isLoading: isFetchingBook,
  error: errorFetchingBook,
  mutate: fetchBook
} = useSWRV(
  () => `books:full-book-${bookId.value}`,
  () => getBook(bookId.value),
  {
    revalidateOnFocus: false
  }
);

const {
  book,
  onSelectTocItem,
  location,
  navigate,
  isLoading,
  isClosingBook,
  displayFromPercentage,
  doChapterSearch,
  doSearch,
  render,
  addHighlights,
  removeHighlights
} = useBook(data, {
  onRendered: ({ iFrames }) => {
    iFrames.forEach((iFrame) => {
      if (iFrame.contentWindow) {
        iFrame.contentWindow.onwheel = (e: Event) => {
          if (settings.value.flow === "scroll") {
            return;
          }
          onWheel(e);
        };
      }
    });
  }
});

const pageRef = useTemplateRef("pageRef");
const footerRef = useTemplateRef("footerRef");
const sidebarRef = useTemplateRef("sidebarRef");
const footerOpen = ref(false);
const sliderValue = computed<[number]>({
  get() {
    return [Numerics.round((location.value?.end.percentage ?? 0) * 100, 0)];
  },
  set(value) {
    displayFromPercentage(value[0] / 100);
  }
});

const searchInputRef = useTemplateRef("searchInputRef");
const searchModalOpen = ref(false);
const searchType = ref("chapter");
const searchText = ref("");
const searchTextDebounced = refDebounced(searchText, 300);
const searchResults = ref<Array<{ cfi: string; excerpt: string }>>([]);
const searchResultCfis = computed(() =>
  searchResults.value.map((result) => result.cfi)
);
const isSearching = ref(false);
watch(
  [searchTextDebounced, searchType],
  async ([newSearchValue, newSearchType]) => {
    if (isSearching.value) {
      return;
    }
    if (newSearchValue) {
      removeHighlights(searchResultCfis.value);
      isSearching.value = true;
      searchResults.value = [];
      if (newSearchType === "chapter") {
        searchResults.value = await doChapterSearch(newSearchValue).finally(
          () => {
            isSearching.value = false;
          }
        );
        if (searchResults.value.length) addHighlights(searchResultCfis.value);
      } else {
        searchResults.value = await doSearch(newSearchValue).finally(() => {
          isSearching.value = false;
        });
        if (searchResults.value.length) addHighlights(searchResultCfis.value);
      }
    }
  }
);
function onSearchModalOpen() {
  setTimeout(() => {
    searchInputRef.value?.inputRef?.focus();
    isClicked.value = false;
  }, 100);
}
function onSearchModalClose() {
  setTimeout(() => {
    removeHighlights(searchResultCfis.value);
    searchText.value = "";
    searchResults.value = [];
  }, 3000);
}
watch(isClicked, (val) => {
  if (val) {
    searchModalOpen.value = val;
  }
});

// Handle left and right click on page; does not affect rendition
useClickZone(pageRef, {
  onZone: (zone) => navigate(zone),
  ignore: [() => footerRef.value?.$el, () => sidebarRef.value?.$el]
});
// Handle wheel scroll on page; affects rendition
const { onWheel } = useWheel(pageRef, {
  onGesture: ({ dir }) => navigate(dir),
  threshold: 10,
  passive: true
});
// Handle arrow key navigation; affects rendition
onKeyStroke("ArrowRight", () => navigate(1));
onKeyStroke("ArrowLeft", () => navigate(-1));
</script>

<template>
  <div ref="pageRef" class="space-y-16 px-4 py-6 h-full select-none">
    <div
      v-if="isFetchingBook || isLoading || isClosingBook"
      class="top-0 left-0 z-10 absolute flex justify-center items-center bg-background w-full h-full"
    >
      <Spinner show-random-labels />
    </div>

    <ErrorAlert
      v-else-if="errorFetchingBook"
      title="Failed to get book"
      :error="errorFetchingBook"
      @retry="fetchBook()"
    />

    <div>
      <div class="relative">
        <div
          id="viewer"
          class="mx-auto md:border-2 md:border-border w-full lg:max-w-[80%] xl:max-w-[85%] h-[80dvh]"
        />

        <Separator
          orientation="vertical"
          :class="{
            hidden: settings.flow === 'scroll' || settings.flow === 'single',
            flex: settings.flow === 'double',
            'hidden xl:flex': settings.flow === 'auto'
          }"
          class="top-0 left-1/2 absolute h-[80dvh] -translate-x-1/2"
        />
      </div>

      <BookSidebar
        ref="sidebarRef"
        :toc="book?.navigation?.toc"
        @select:toc-item="onSelectTocItem"
      />
      <div
        v-if="uiStore.bookSliderOpen"
        class="bottom-24 left-1/2 absolute w-[80%] -translate-x-1/2"
      >
        <Slider v-model="sliderValue" :min="0" :max="100" :step="1">
          <template #tooltip="{ value }">
            <p class="font-medium text-xs">{{ value }}%</p>
          </template>
        </Slider>
      </div>

      <BookFooter
        ref="footerRef"
        v-model:open="footerOpen"
        v-model:slider-open="uiStore.bookSliderOpen"
        :book="data"
        :location
      />

      <Modal
        v-model:open="searchModalOpen"
        title="Search"
        :ui="{ body: 'pt-0' }"
        @open="onSearchModalOpen"
        @close="onSearchModalClose"
      >
        <template #body>
          <div class="relative">
            <div class="top-0 sticky flex bg-surface py-2">
              <InputText
                ref="searchInputRef"
                v-model="searchText"
                :placeholder="`Search ${searchType}...`"
                class="w-full h-10"
              />
              <div class="grid grid-cols-2 bg-muted/30 p-1 h-10 shrink-0">
                <button
                  v-for="type in ['chapter', 'book']"
                  :key="type"
                  :class="[
                    'px-2 py-1',
                    searchType === type ? 'bg-surface text-primary' : ''
                  ]"
                  @click="searchType = type"
                >
                  {{ type }}
                </button>
              </div>
            </div>

            <div class="mt-5">
              <BookSearchResults
                :data="searchResults"
                :search="searchTextDebounced"
                :loading="isSearching"
                @select="render"
              />
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </div>
</template>
