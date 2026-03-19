<script setup lang="ts">
import type { NavItem } from "epubjs";

const { reset } = useBookSettings();

interface Props {
  toc?: NavItem[];
}

const { toc = [] } = defineProps<Props>();
const emit = defineEmits<{
  "select:toc-item": [item: NavItem];
}>();

const tocOpen = ref(false);
const bookmarksOpen = ref(false);
const appearanceOpen = ref(false);

function onSelectTocItem(item: NavItem) {
  tocOpen.value = false;
  emit("select:toc-item", item);
}
</script>

<template>
  <div class="lg:right-[7%] xl:right-[5%] bottom-[11dvh] absolute">
    <div class="flex flex-col items-center gap-2">
      <Modal v-model:open="tocOpen" title="Table of Contents">
        <Button
          color="neutral"
          variant="outline"
          icon="lucide:table-of-contents"
        />
        <template #body>
          <BookToc :toc="toc" @select="onSelectTocItem" />
        </template>
      </Modal>

      <Modal v-model:open="bookmarksOpen" title="Bookmarks">
        <Button color="neutral" variant="outline" icon="lucide:bookmark" />
      </Modal>

      <Button color="neutral" variant="outline" icon="lucide:highlighter" />

      <Modal v-model:open="appearanceOpen" title="Font and Layout">
        <Button color="neutral" variant="outline" icon="lucide:type" />
        <template #body>
          <div class="space-y-5">
            <BookFontFamilySetter />
            <BookFontSizeSetter />
            <BookTextSpacingSetter />
            <BookLayoutSetter />
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <Button
              color="neutral"
              variant="outline"
              icon="lucide:refresh-ccw"
              label="Reset"
              @click="reset()"
            />
          </div>
        </template>
      </Modal>
    </div>
  </div>
</template>
