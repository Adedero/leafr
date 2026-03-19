<script setup lang="ts">
import { assetUrl } from "@renderer/utils/asset-url";
import type { FullBook } from "src/main/database/schema";
import Logo from "../global/Logo.vue";
import { Numerics } from "@renderer/utils/numerics";
import type { TBookLocation } from "@renderer/hooks/use-book";

interface Props {
  book?: FullBook | null;
  location?: TBookLocation | null;
}

const { book } = defineProps<Props>();

const open = defineModel<boolean>("open", { default: false });
const sliderOpen = defineModel<boolean>("slider-open", { default: false });

function toggleSlider() {
  if (sliderOpen.value) {
    sliderOpen.value = false;
    return;
  }
  UIStore.bookFooterLocked = true;
  sliderOpen.value = true;
}

const UIStore = useUiStore();

const hoverTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const isHovering = ref(false);

function clearHoverTimer() {
  if (hoverTimer.value !== null) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }
}

function onMouseEnter() {
  if (UIStore.bookFooterLocked) return;

  isHovering.value = true;
  clearHoverTimer();

  hoverTimer.value = setTimeout(() => {
    if (isHovering.value) {
      open.value = true;
    }
  }, 300);
}

function onMouseLeave() {
  if (UIStore.bookFooterLocked) return;

  isHovering.value = false;
  clearHoverTimer();

  hoverTimer.value = setTimeout(() => {
    if (!isHovering.value) {
      open.value = false;
    }
  }, 500);
}
</script>

<template>
  <div @mouseleave="onMouseLeave">
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
        class="bottom-0 left-0 z-50 absolute px-4 pb-3 w-full"
      >
        <div
          class="gap-x-5 grid grid-cols-3 bg-accent lg:mx-auto p-1 border-2 border-border w-full lg:max-w-[90dvw] text-surface volt:text-text"
        >
          <!-- Book Cover & Info -->
          <div class="hidden md:flex items-center gap-2">
            <div
              class="flex justify-center items-center bg-surface p-0.5 border-2 border-border w-16 h-16 shrink-0"
            >
              <img
                v-if="book.coverImagePath && book.coverImagePath.length > 2"
                :src="assetUrl(book.coverImagePath)"
                class="w-full h-full object-cover"
              />
              <Logo v-else :width="40" color="var(--color-text)" />
            </div>

            <div class="min-w-0">
              <p class="font-semibold text-sm truncate">
                {{ book.title }}
              </p>
              <p class="font-medium text-xs truncate">
                {{ book.author }}
              </p>
              <p v-if="location" class="text-xs">
                {{ Numerics.round(location?.end.percentage * 100, 0) }}%
              </p>
            </div>
          </div>

          <!-- Location Info & Slider -->
          <div v-if="location" class="flex justify-center items-center">
            <div class="md:text-center truncate">
              <p class="font-semibold text-sm">
                {{ location.current?.label }}
              </p>
              <p class="text-xs">
                {{ location.current?.page }}/{{ location.current?.total }}
              </p>
            </div>
          </div>

          <div>
            <!-- Icons -->
            <div class="flex justify-end items-center gap-1">
              <Button
                icon="lucide:file-sliders"
                size="sm"
                class="hover:bg-surface/20 text-surface hover:text-surface"
                :class="{ 'bg-surface/20': sliderOpen }"
                @click="toggleSlider"
              />

              <Modal
                title="Info"
                icon="lucide:info"
                @open="UIStore.bookFooterLocked = true"
              >
                <Button
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="lucide:info"
                  class="hover:bg-surface/20 text-surface hover:text-surface"
                />

                <template #body>
                  <BookInfo :book />
                </template>
              </Modal>

              <Button
                color="neutral"
                variant="ghost"
                size="sm"
                :icon="
                  UIStore.bookFooterLocked ? 'lucide:lock' : 'lucide:lock-open'
                "
                class="hover:bg-surface/20 text-surface hover:text-surface"
                @click="UIStore.toggleBookFooterLocked"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div
      class="bottom-0 left-0 z-10 absolute bg-transparent w-full h-20"
      :class="{ 'pointer-events-none': open }"
      @mouseenter="onMouseEnter"
    >
      <div
        v-show="!open && !UIStore.bookFooterLocked"
        class="flex justify-between items-center px-6 h-full"
      >
        <div v-if="location">
          <p class="text-sm">
            {{ location.current?.label }}
          </p>
          <p class="text-xs">
            {{ location.current?.page }}/{{ location.current?.total }}
          </p>
        </div>

        <p v-if="location" class="text-sm">
          {{ Numerics.round(location?.end.percentage * 100, 0) }}%
        </p>
      </div>
    </div>
  </div>
</template>
