<script setup lang="ts">
import Button from "@renderer/components/ui/Button.vue";
import Modal from "@renderer/components/ui/Modal.vue";
import BookInfo from "@renderer/components/book/BookInfo.vue";
import type { TBookLocation } from "@renderer/pages/Book.vue";
import useUIStore from "@renderer/stores/use-ui-store";
import assetURL from "@renderer/utils/asset-url";
import debounce from "@renderer/utils/debounce";
import { FullBook } from "src/main/database/schema";
import Logo from "../global/Logo.vue";

interface Props {
  book?: FullBook | null;
  location?: TBookLocation | null;
}

const { book } = defineProps<Props>();

const open = defineModel<boolean>("open", { default: false });

const UIStore = useUIStore();

const onMouseEnter = debounce(() => {
  open.value = true;
}, 300);

const onMouseLeave = debounce(() => {
  open.value = UIStore.bookFooterLocked || false;
}, 300);
</script>

<template>
  <div>
    <Transition
      enter-from-class="opacity-0"
      enter-active-class="transition duration-200 ease-out"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      leave-active-class="transition duration-200 ease-in"
    >
      <div
        v-if="book && (open || UIStore.bookFooterLocked)"
        ref="footerRef"
        class="absolute z-50 bottom-0 left-0 w-full pb-3 px-4"
        @mouseleave="onMouseLeave"
      >
        <div
          class="w-full lg:max-w-[90dvw] lg:mx-auto bg-accent border-2 border-border p-1 grid grid-cols-3 gap-x-5 text-surface volt:text-text"
        >
          <!-- Book Cover & Info -->
          <div class="hidden md:flex items-center gap-2">
            <div
              class="border-2 border-border p-0.5 h-16 w-16 shrink-0 bg-surface flex items-center justify-center"
            >
              <img
                v-if="book.coverImagePath && book.coverImagePath.length > 2"
                :src="assetURL(book.coverImagePath)"
                class="w-full h-full object-cover"
              />
              <Logo v-else :width="40" color="var(--color-text)" />
            </div>

            <div class="min-w-0">
              <p class="text-sm font-semibold truncate">
                {{ book.title }}
              </p>
              <p class="text-xs font-medium truncate">{{ book.author }}</p>
            </div>
          </div>

          <!-- Location Info & Slider -->
          <div>
            <div v-if="location" class="md:text-center truncate">
              <p class="text-sm text-semibold">{{ location.current?.label }}</p>
              <p class="text-xs">{{ location.current?.page }}/{{ location.current?.total }}</p>
            </div>

            <!-- <p class="text-xs">slider and progress here (pages or percentages)</p> -->
          </div>

          <div>
            <!-- Icons -->
            <div class="flex items-center gap-1 justify-end">
              <Modal title="Info" icon="lucide:info" @open="UIStore.bookFooterLocked = true">
                <Button
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="lucide:info"
                  class="text-surface hover:bg-surface/20 hover:text-surface"
                />

                <template #body>
                  <BookInfo :book />
                </template>
              </Modal>

              <Button
                color="neutral"
                variant="ghost"
                size="sm"
                :icon="UIStore.bookFooterLocked ? 'lucide:lock' : 'lucide:lock-open'"
                class="text-surface"
                @click="UIStore.toggleBookFooterLocked"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div
      @mouseenter="onMouseEnter"
      class="bg-transparent absolute h-20 w-full left-0 bottom-0 z-10"
      :class="{ 'pointer-events-none': open }"
    />
  </div>
</template>
