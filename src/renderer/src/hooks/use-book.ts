import epub, { type Rendition, type Book, type NavItem } from "epubjs";
import type { Location } from "epubjs/types/rendition";
import type { FullBook } from "src/main/database/schema";

export type TBookLocation = Location & {
  current?: {
    navItem?: NavItem;
    label?: string;
    page: number;
    total: number;
  };
};

export type TBookLoadOptions = {
  el?: string;
  position?: string;
};

export type OnRenderedParams = {
  rendition: Rendition;
  iFrames: NodeListOf<HTMLIFrameElement>;
};

export type UseBookOptions = {
  onRendered?: (params: OnRenderedParams) => void;
};

export const useBook = (
  input: Ref<FullBook | null | undefined>,
  options?: UseBookOptions
) => {
  const { beforeBookClose, updateReadingProgress, saveBookLocations } =
    useBookUtils();
  const { settings } = useBookSettings();
  const { theme } = useTheme();

  const { onRendered } = options || {};

  const book = ref<Book | null>(null);
  const rendition = ref<Rendition | null>(null);
  const location = ref<TBookLocation | null>(null);
  const pages = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const iFrames = ref<NodeListOf<HTMLIFrameElement> | null>(null);

  const { isLoading: isClosingBook, executeImmediate: closeBook } =
    useAsyncState(beforeBookClose, null, { immediate: false });

  const {
    isLoading: isSavingReadingProgress,
    executeImmediate: saveReadingProgress
  } = useAsyncState(updateReadingProgress, null, { immediate: false });

  watch(input, () => load(), { deep: false });

  watch([settings, theme], applySettings, { deep: true });

  const viewOptions = computed(() => {
    const flow = settings.value.flow;

    switch (flow) {
      case "scroll":
        return {
          manager: "continuous",
          flow: "scrolled",
          axis: "vertical"
          // 👇 remove navigation listeners elsewhere based on this mode
        };

      case "single":
        return {
          manager: "default",
          flow: "paginated",
          spread: "none"
        };

      case "double":
        return {
          manager: "default",
          flow: "paginated",
          spread: "always",
          minSpreadWidth: 0
        };

      case "auto":
      default:
        return {
          manager: "default",
          flow: "paginated",
          spread: "auto"
        };
    }
  });

  watch(
    () => settings.value.flow,
    () => load()
  );

  async function load(opts: TBookLoadOptions = {}) {
    if (!input.value) {
      return;
    }
    const {
      el = "viewer",
      position = input.value.readingProgress?.cfi || undefined
    } = opts;

    isLoading.value = true;

    try {
      if (rendition.value) {
        rendition.value.destroy();
      }

      book.value = epub(assetUrl(input.value.fileURL));

      let locs: string[] = [];
      if (input.value.locations?.locations) {
        locs = book.value.locations.load(input.value.locations.locations);
        pages.value = locs.length;
      } else {
        await book.value.ready;
        locs = await book.value.locations.generate(1024);
        saveBookLocations({
          bookId: input.value.id,
          locations: book.value.locations.save()
        });
      }

      rendition.value = book.value.renderTo(el, {
        height: "100%",
        width: "100%",
        allowPopups: true,
        allowScriptedContent: true,
        ...viewOptions.value
      });

      addRendtionListeners();
      await rendition.value.display(position);
      applySettings();

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: toError(error) };
    } finally {
      isLoading.value = false;
    }
  }

  function addRendtionListeners() {
    if (!rendition.value) {
      return;
    }
    rendition.value.on("keyup", onRenditionKeyUp);
    rendition.value.on("relocated", onRenditionRelocated);
    rendition.value.on("rendered", onRenditionRendered);
  }

  function onRenditionRendered() {
    if (!rendition.value) {
      return;
    }
    iFrames.value = document.querySelectorAll("#viewer iframe");
    iFrames.value.forEach((iFrame) => {
      if (iFrame.contentWindow) {
        iFrame.contentWindow.onwheel = null;
      }
    });
    if (onRendered) {
      //@ts-expect-error rendition
      onRendered({ rendition: rendition.value, iFrames: iFrames.value });
    }
  }

  function onRenditionKeyUp(e: KeyboardEvent) {
    if (settings.value.flow === "scroll") {
      return;
    }
    if (e.key === "ArrowRight") {
      navigate(1);
    } else if (e.key === "ArrowLeft") {
      navigate(-1);
    }
  }

  function onRenditionRelocated(loc: Location) {
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
      total = Math.ceil(startTotal / 2);
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
  }

  function findTocItem(
    toc: NavItem[],
    href: string,
    parentLabel?: string
  ): { item: NavItem; label: string } | undefined {
    for (const item of toc) {
      const itemHref = item.href.split("#")[0];
      const targetHref = href.split("#")[0];
      const trimmed = Char.collapseWhitespace(item.label);

      const currentLabel = parentLabel
        ? `${parentLabel} >> ${trimmed}`
        : trimmed;

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
    rendition.value.themes.default({
      "h1, h2, h3, h4, h5, h6, p, span, b, i, small, div, li, td, th, blockquote, pre, code":
        {
          color: `${text} !important`,
          "font-family":
            settings.value.fontFamily.toLowerCase() === "default"
              ? ""
              : `${settings.value.fontFamily} !important`,
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

  const isNavigating = ref(false);

  async function navigate(dir: 1 | -1 | string) {
    if (!book.value || !rendition.value || isNavigating.value) return;
    if (settings.value.flow === "scroll") return;

    isNavigating.value = true;
    try {
      if (dir === 1 || dir === "right") {
        await rendition.value.next();
      } else if (dir === -1 || dir === "left") {
        await rendition.value.prev();
      }
    } finally {
      isNavigating.value = false;
    }
  }

  function displayFromPercentage(p: number) {
    if (!rendition.value || !book.value) {
      return;
    }
    const cfi = book.value.locations.cfiFromPercentage(p);
    if (cfi) {
      rendition.value.display(cfi);
    }
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

  const doSearch = async (
    q: string
  ): Promise<{ cfi: string; excerpt: string }[]> => {
    if (!rendition.value) return [];

    const book = rendition.value.book;
    const results: { cfi: string; excerpt: string }[] = [];

    for (const item of book.spine.spineItems) {
      try {
        await item.load(book.load.bind(book));
        const res = await item.find(q);
        results.push(...res);
      } finally {
        item.unload();
      }
    }

    return results;
  };

  //Searching the current chapter
  const doChapterSearch = async (
    q: string
  ): Promise<{ cfi: string; excerpt: string }[]> => {
    if (!book.value || !rendition.value || !location.value) {
      return [];
    }

    const item = book.value.spine.get(location.value.start.cfi);
    if (!item) return [];

    try {
      await item.load(book.value.load.bind(book.value));
      const results = item.find(q);
      return results as unknown as { cfi: string; excerpt: string }[];
    } finally {
      item.unload();
    }
  };

  function render(href: string) {
    if (!rendition.value) return;
    rendition.value.display(href);
  }

  function addHighlights(cfi: string | string[]) {
    if (!rendition.value) return;
    const cfis = Array.isArray(cfi) ? cfi : [cfi];
    cfis.forEach((cfi) => {
      rendition.value?.annotations.add("highlight", cfi);
    });
  }

  function removeHighlights(cfi: string | string[]) {
    if (!rendition.value) return;
    const cfis = Array.isArray(cfi) ? cfi : [cfi];
    cfis.forEach((cfi) => {
      rendition.value?.annotations.remove(cfi, "highlight");
    });
  }

  onBeforeRouteLeave(async (_to, _from, next) => {
    await closeBook({
      bookId: input.value?.id ?? "",
      cfi: location.value?.end.cfi ?? "",
      percentage: location.value?.end.percentage ?? 0
    });
    next();
  });

  onMounted(async () => {
    load();
  });

  onUnmounted(async () => {
    if (iFrames.value) {
      iFrames.value.forEach((iFrame) => {
        if (iFrame.contentWindow) {
          iFrame.contentWindow.onwheel = null;
        }
      });
    }
    if (rendition.value) {
      rendition.value.destroy();
    }
    if (book.value) {
      book.value.destroy();
    }
  });

  return {
    book,
    location,
    rendition,
    iFrames,

    load,
    isLoading,

    isClosingBook,
    closeBook,

    isSavingReadingProgress,
    saveReadingProgress,

    onSelectTocItem,

    navigate,
    displayFromPercentage,

    doSearch,
    doChapterSearch,
    render,
    addHighlights,
    removeHighlights
  };
};
