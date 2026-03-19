<script setup lang="ts">
import useSWRV from "swrv";

const route = useRoute();
const { getBook } = useBookUtils();
const { settings } = useBookSettings();
const uiStore = useUiStore();

const bookId = route.params.bookId.toString();

// reregister event listeners when rendition resizes
const {
  data,
  isLoading: isFetchingBook,
  error: errorFetchingBook,
  mutate: fetchBook
} = useSWRV(
  () => `books:full-book-${bookId}`,
  () => getBook(bookId),
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
  displayFromPercentage
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
      {{ location?.end.percentage }}
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
    </div>
  </div>
</template>
