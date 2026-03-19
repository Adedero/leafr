<script setup lang="ts">
import type { Component } from "vue";

import LucideHome from "~icons/lucide/home";
import LucideUser from "~icons/lucide/user";
import LucideLoaderCircle from "~icons/lucide/loader-circle";
import LucidePlus from "~icons/lucide/plus";
import LucidePalette from "~icons/lucide/palette";
import LucideX from "~icons/lucide/x";
import LucideExpand from "~icons/lucide/expand";
import LucideMinimize from "~icons/lucide/minimize";
import LucideGripVertical from "~icons/lucide/grip-vertical";
import LucideLibraryBig from "~icons/lucide/library-big";
import LucideBookmark from "~icons/lucide/bookmark";
import LucideBarChartBig from "~icons/lucide/bar-chart-big";
import LucideSettings from "~icons/lucide/settings";
import LucideGlobe from "~icons/lucide/globe";
import LucideRefreshCcw from "~icons/lucide/refresh-ccw";
import LucideSearch from "~icons/lucide/search";
import LucideBookOpen from "~icons/lucide/book-open";
import LucideCircleAlert from "~icons/lucide/circle-alert";
import LucideLockOpen from "~icons/lucide/lock-open";
import LucideLock from "~icons/lucide/lock";
import LucideInfo from "~icons/lucide/info";
import LucideTableOfContents from "~icons/lucide/table-of-contents";
import LucideType from "~icons/lucide/type";
import LucideChevronDown from "~icons/lucide/chevron-down";
import LucideChevronUp from "~icons/lucide/chevron-up";
import LucideHighlighter from "~icons/lucide/highlighter";
import LucideMinus from "~icons/lucide/minus";
import LucideFileSliders from "~icons/lucide/file-sliders";

export interface IconProps {
  name: IconName;
  size?: number | string;
}

const { name, size = 16 } = defineProps<IconProps>();

const iconMap = {
  "lucide:home": LucideHome,
  "lucide:user": LucideUser,
  "lucide:loader-circle": LucideLoaderCircle,
  "lucide:plus": LucidePlus,
  "lucide:palette": LucidePalette,
  "lucide:x": LucideX,
  "lucide:expand": LucideExpand,
  "lucide:minimize": LucideMinimize,
  "lucide:grip-vertical": LucideGripVertical,
  "lucide:library-big": LucideLibraryBig,
  "lucide:bookmark": LucideBookmark,
  "lucide:bar-chart-big": LucideBarChartBig,
  "lucide:settings": LucideSettings,
  "lucide:globe": LucideGlobe,
  "lucide:refresh-ccw": LucideRefreshCcw,
  "lucide:search": LucideSearch,
  "lucide:book-open": LucideBookOpen,
  "lucide:circle-alert": LucideCircleAlert,
  "lucide:lock-open": LucideLockOpen,
  "lucide:lock": LucideLock,
  "lucide:info": LucideInfo,
  "lucide:table-of-contents": LucideTableOfContents,
  "lucide:type": LucideType,
  "lucide:chevron-down": LucideChevronDown,
  "lucide:chevron-up": LucideChevronUp,
  "lucide:highlighter": LucideHighlighter,
  "lucide:minus": LucideMinus,
  "lucide:file-sliders": LucideFileSliders
} as const;

export type IconName = keyof typeof iconMap;

const component = computed<Component | null>(() => {
  return iconMap[name] ?? null;
});
</script>

<template>
  <component :is="component" v-if="component" :size="size" v-bind="$attrs" />
</template>
