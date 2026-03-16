<script setup lang="ts">
import useBook from "@renderer/hooks/use-book";
import { onKeyStroke, useAsyncState } from "@vueuse/core";
import useSWRV from "swrv";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import epub, { type Rendition, type Book } from "epubjs";
import { ref, useTemplateRef, watch } from "vue";
import assetURL from "@renderer/utils/asset-url";
import { onUnmounted } from "vue";
import useWheel from "@renderer/hooks/use-wheel";
import useTheme from "@renderer/hooks/use-theme";
import type { Location } from "epubjs/types/rendition";
import Spinner from "@renderer/components/ui/Spinner.vue";
import ErrorAlert from "@renderer/components/global/ErrorAlert.vue";
import BookFooter from "@renderer/components/book/BookFooter.vue";

const route = useRoute();
const { getBook, onBeforeClose } = useBook();
const { theme } = useTheme();

const bookId = route.params.bookId.toString();

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

watch(data, initBook);

const book = ref<Book | null>(null);
const rendition = ref<Rendition | null>(null);
const location = ref<Location | null>(null);
const pages = ref<number>(0);
const iFrame = ref<HTMLIFrameElement | null>(null);
const pageRef = useTemplateRef("pageRef");

const { onWheel } = useWheel(pageRef, {
  onGesture: ({ dir }) => navigate(dir),
  threshold: 10,
  passive: true
});
onKeyStroke("ArrowRight", () => navigate(1));
onKeyStroke("ArrowLeft", () => navigate(-1));

const isBookLoaded = ref(false);

async function initBook() {
  isBookLoaded.value = false;

  try {
    if (!data.value || book.value) {
      return;
    }
    book.value = epub(assetURL(data.value.fileURL));
    await book.value.ready;
    pages.value = (await book.value.locations.generate(1024)).length;
    // book.value.ready.then(() => {
    //   book.value?.locations.generate(1024).then((locs) => {
    //     pages.value = locs.length;
    //   });
    // });

    rendition.value = book.value.renderTo("viewer", {
      height: "100%",
      width: "100%",
      spread: "always",
      allowScriptedContent: true
    });
    //rendition.value.annotations.highlight
    rendition.value.on("keyup", (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        navigate(1);
      } else if (e.key === "ArrowLeft") {
        navigate(-1);
      }
    });
    rendition.value.on("rendered", () => {
      iFrame.value = document.querySelector("#viewer iframe");
      if (iFrame.value?.contentWindow) {
        iFrame.value.contentWindow.addEventListener("wheel", onWheel, { passive: false });
      }
    });

    rendition.value.on("relocated", (loc: Location) => {
      location.value = loc;
    });

    await rendition.value.display(data.value.readingProgress?.cfi);
    applyThemes();
  } finally {
    isBookLoaded.value = true;
  }
}

async function applyThemes() {
  if (!rendition.value) {
    return;
  }

  const style = getComputedStyle(document.documentElement);
  const text = style.getPropertyValue("--color-text").trim();
  const bg = style.getPropertyValue("--color-background").trim();
  const accent = style.getPropertyValue("--color-accent").trim();

  rendition.value.themes.default({
    "h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, blockquote, pre, code": {
      color: `${text} !important`,
      "font-size": "20px"
    },
    "a, a:visited, a:hover": {
      color: `${accent} !important`
    },
    body: {
      background: `${bg} !important`
    }
  });
}

watch(theme, applyThemes);

async function navigate(dir: 1 | -1) {
  if (!book.value || !rendition.value) {
    return;
  }
  if (dir === 1) {
    rendition.value.next();
  } else {
    rendition.value.prev();
  }
}

onUnmounted(() => {
  book.value?.destroy();
  if (iFrame.value?.contentWindow) {
    iFrame.value.contentWindow.removeEventListener("wheel", onWheel);
  }
});

// Before closing a book
const { isLoading: isClosingBook, executeImmediate: closeBook } = useAsyncState(
  onBeforeClose,
  null,
  { immediate: false }
);

onBeforeRouteLeave(async (_to, _from, next) => {
  await closeBook({
    bookId,
    cfi: location.value?.end.cfi ?? "",
    percentage: location.value?.end.percentage ?? 0
  });
  next();
});
</script>

<template>
  <div ref="pageRef" class="h-full space-y-16 px-4 py-6">
    <div
      v-if="isFetchingBook || !isBookLoaded || isClosingBook"
      class="absolute left-0 top-0 h-full w-full z-10 bg-background flex items-center justify-center"
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
      <div
        id="viewer"
        class="md:border-2 md:border-border h-[80dvh] mx-auto w-full lg:max-w-[80%] xl:max-w-[85%] text-red!"
      />

      <BookFooter />
    </div>
  </div>
</template>
