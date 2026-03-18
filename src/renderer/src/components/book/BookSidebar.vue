<script setup lang="ts">
import type { NavItem } from "epubjs";

interface Props {
  toc?: NavItem[];
}

const { toc = [] } = defineProps<Props>();
const emit = defineEmits<{
  "select:toc-item": [item: NavItem];
}>();

const tocOpen = ref(false);
const bookmarksOpen = ref(false);

function onSelectTocItem(item: NavItem) {
  tocOpen.value = false;
  emit("select:toc-item", item);
}
</script>

<template>
  <div class="absolute lg:right-[7%] xl:right-[5%] bottom-[11dvh]">
    <div class="flex flex-col items-center gap-2">
      <Modal v-model:open="tocOpen" title="Table of Contents">
        <Button color="neutral" variant="outline" icon="lucide:table-of-contents" />
        <template #body>
          <BookToc :toc="toc" @select="onSelectTocItem" />
        </template>
      </Modal>

      <Modal v-model:open="bookmarksOpen" title="Bookmarks">
        <Button color="neutral" variant="outline" icon="lucide:bookmark" />
      </Modal>

      <Button color="neutral" variant="outline" icon="lucide:highlighter" />
      <Button color="neutral" variant="outline" icon="lucide:type" />
    </div>
  </div>
</template>
