<script setup lang="ts">
import { computed, type Component } from "vue";
// @ts-ignore
import LucideHome from "~icons/lucide/home";
// @ts-ignore
import LucideUser from "~icons/lucide/user";
// @ts-ignore
import LucideLoaderCircle from "~icons/lucide/loader-circle";
// @ts-ignore
import LucidePlus from "~icons/lucide/plus";
// @ts-ignore
import LucidePalette from "~icons/lucide/palette";
// @ts-ignore
import LucideX from "~icons/lucide/x";
// @ts-ignore
import LucideExpand from "~icons/lucide/expand";
// @ts-ignore
import LucideMinimize from "~icons/lucide/minimize";
// @ts-ignore
import LucideGripVertical from "~icons/lucide/grip-vertical";
// @ts-ignore
import LucideLibraryBig from "~icons/lucide/library-big";
// @ts-ignore
import LucideBookmark from "~icons/lucide/bookmark";
// @ts-ignore
import LucideBarChartBig from "~icons/lucide/bar-chart-big";
// @ts-ignore
import LucideSettings from "~icons/lucide/settings";
// @ts-ignore
import LucideGlobe from "~icons/lucide/globe";
// @ts-ignore
import LucideRefreshCcw from "~icons/lucide/refresh-ccw";
// @ts-ignore
import LucideSearch from "~icons/lucide/search";
// @ts-ignore
import LucideBookOpen from "~icons/lucide/book-open";
// @ts-ignore
import LucideCircleAlert from "~icons/lucide/circle-alert";

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
} as const;

export type IconName = keyof typeof iconMap;

const component = computed<Component | null>(() => {
  return iconMap[name] ?? null;
});
</script>

<template>
  <component v-if="component" :is="component" :size="size" v-bind="$attrs" />
</template>
