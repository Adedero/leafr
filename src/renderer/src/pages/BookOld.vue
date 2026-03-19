<script setup lang="ts">
import useSWRV from "swrv";
import epub, { type Rendition, type Book, type NavItem } from "epubjs";
import type { Location } from "epubjs/types/rendition";
import type Section from "epubjs/types/section";

const route = useRoute();
const { getBook, beforeBookClose, saveBookLocations } = useBookUtils();
const { theme } = useTheme();

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

watch(data, initBook, { deep: false });

export type TBookLocation = Location & {
  current?: {
    navItem?: NavItem;
    label?: string;
    page: number;
    total: number;
  };
};

const book = ref<Book | null>(null);
const rendition = ref<Rendition | null>(null);
const location = ref<TBookLocation | null>(null);
const pages = ref<number>(0);
const iFrames = ref<NodeListOf<HTMLIFrameElement> | null>(null);
const pageRef = useTemplateRef("pageRef");
const footerRef = useTemplateRef("footerRef");
const sidebarRef = useTemplateRef("sidebarRef");
const footerOpen = ref(false);

interface BookSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  wordSpacing: number;
  paragraphSpacing: number;
  flow: "scroll" | "paginated" | "auto";
}
const settings = ref<BookSettings>({
  fontSize: 24,
  fontFamily: "Geist Mono",
  lineHeight: 1.8,
  wordSpacing: 0,
  paragraphSpacing: 10,
  flow: "auto" // "single", "auto" or "scroll"
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

const isBookLoaded = ref(false);
async function initBook() {
  isBookLoaded.value = false;

  try {
    if (!data.value || book.value) {
      return;
    }
    book.value = epub(assetUrl(data.value.fileURL));
    let locs: string[] = [];
    if (data.value.locations?.locations) {
      locs = book.value.locations.load(data.value.locations.locations);
      pages.value = locs.length;
    } else {
      await book.value.ready;
      locs = await book.value.locations.generate(1024);
      pages.value = locs.length;
      saveBookLocations({ bookId, locations: book.value.locations.save() });
    }

    rendition.value = book.value.renderTo("viewer", {
      height: "100%",
      width: "100%",
      manager: "continuous",
      flow: "auto",
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
      iFrames.value = document.querySelectorAll("#viewer iframe");
      iFrames.value.forEach((iFrame) => {
        iFrame.contentWindow?.addEventListener("wheel", onWheel, {
          passive: false
        });
      });
    });

    rendition.value.on("relocated", (loc: Location) => {
      if (!book.value) return;
      const targetHref = loc.start.href;
      const current = findTocItem(book.value.navigation.toc, targetHref);

      let page: number = 0;
      let total: number = 0;

      const { page: startPage, total: startTotal } = loc.start.displayed;
      const { page: endPage } = loc.end.displayed;

      if (startPage === endPage) {
        page = startPage;
        total = startTotal;
      } else {
        page = Math.ceil((endPage == 1 ? startPage : endPage) / 2);
        total = startTotal / 2;
      }

      location.value = {
        ...loc,
        current: {
          navItem: current?.item,
          label: current?.label.trim(),
          page,
          total
        }
      };
    });

    await rendition.value.display(data.value.readingProgress?.cfi || undefined);
    applySettings();
  } finally {
    isBookLoaded.value = true;
  }
}

function findTocItem(
  toc: NavItem[],
  href: string,
  parentLabel?: string // Accumulate the label path
): { item: NavItem; label: string } | undefined {
  for (const item of toc) {
    // Better matching logic: Use canonical or at least strip query params
    const itemHref = item.href.split("#")[0];
    const targetHref = href.split("#")[0];
    const trimmed = Char.collapseWhitespace(item.label);

    const currentLabel = parentLabel ? `${parentLabel} >> ${trimmed}` : trimmed;

    if (itemHref.includes(targetHref) || targetHref.includes(itemHref)) {
      return { item, label: currentLabel };
    }

    if (item.subitems?.length) {
      const found = findTocItem(item.subitems, href, currentLabel);
      if (found) return found;
    }
  }
  return undefined;
}

function applySettings() {
  if (!rendition.value) return;

  const style = getComputedStyle(document.documentElement);
  const text = style.getPropertyValue("--color-text").trim();
  const bg = style.getPropertyValue("--color-background").trim();
  const accent = style.getPropertyValue("--color-accent").trim();

  rendition.value.themes.fontSize(`${settings.value.fontSize}px`);
  if (settings.value.fontFamily !== "default") {
    rendition.value.themes.font(settings.value.fontFamily);
  }
  rendition.value.themes.default({
    "h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, blockquote, pre, code": {
      color: `${text} !important`,
      "word-spacing": `${settings.value.wordSpacing}px !important`
    },
    p: {
      "margin-bottom": `${settings.value.paragraphSpacing}px !important`
    },
    "a, a:visited, a:hover": {
      color: `${accent} !important`
    },
    body: {
      background: `${bg} !important`,
      "line-height": `${settings.value.lineHeight} !important`
    }
  });
}

function onSelectTocItem(item: NavItem) {
  if (!rendition.value || !book.value) return;
  const href = item.href;
  // @ts-ignore spine actually exists
  const spineItem: Section = book.value.spine.items.find((s: Section) =>
    s.href.endsWith(href.split("#")[0])
  );
  rendition.value.display(spineItem?.href ?? href);
}

watch([settings, theme], applySettings);

async function navigate(dir: 1 | -1 | string) {
  if (!book.value || !rendition.value) {
    return;
  }
  if (dir === 1 || dir === "right") {
    rendition.value.next();
  } else if (dir === -1 || dir === "left") {
    rendition.value.prev();
  }
}

onUnmounted(() => {
  book.value?.destroy();
  if (iFrames.value) {
    iFrames.value.forEach((iFrame) => {
      iFrame.contentWindow?.removeEventListener("wheel", onWheel);
    });
  }
});

// Before closing a book
const { isLoading: isClosingBook, executeImmediate: closeBook } = useAsyncState(
  beforeBookClose,
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
  <div ref="pageRef" class="space-y-16 px-4 py-6 h-full select-none">
    <div
      v-if="isFetchingBook || !isBookLoaded || isClosingBook"
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
          class="top-0 left-1/2 absolute h-[80dvh] -translate-x-1/2"
        />
      </div>

      <BookSidebar
        ref="sidebarRef"
        :toc="book?.navigation?.toc"
        @select:toc-item="onSelectTocItem"
      />
      <BookFooter
        ref="footerRef"
        v-model:open="footerOpen"
        :book="data"
        :location
      />
    </div>
  </div>
</template>
