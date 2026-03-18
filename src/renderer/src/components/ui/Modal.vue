<script setup lang="ts">
import { UIAction } from "@renderer/types/ui.type";
import Icon, { type IconName } from "./Icon.vue";
import Overlay from "./Overlay.vue";
import Button from "./Button.vue";
import { twMerge } from "tailwind-merge";

interface ModalUI {
  root?: string;
  overlay?: string;
  header?: string;
  title?: string;
  description?: string;
  body?: string;
  footer?: string;
  close?: string;
}

interface Props {
  title?: string;
  icon?: IconName;
  description?: string;
  body?: string;
  dismissable?: boolean;
  overlay?: boolean;
  close?: IconName | boolean;
  actions?: UIAction[];
  draggable?: boolean;
  dragIcon?: IconName;
  showFullScreenIcon?: boolean;
  ui?: ModalUI;
}

const {
  title = undefined,
  icon = undefined,
  description = undefined,
  body = undefined,
  dismissable = true,
  overlay = true,
  close = true,
  draggable = false,
  dragIcon = undefined,
  actions = [],
  showFullScreenIcon = false,
  ui = {}
} = defineProps<Props>();

const emit = defineEmits<{
  open: [];
  close: [];
  "close:prevent": [];
}>();

const open = defineModel<boolean>("open", { default: false });
const fullscreen = defineModel<boolean>("fullscreen", { default: false });

watch(open, (val) => {
  document.body.style.overflow = val ? "hidden" : "";
  if (val) emit("open");
});

const slots = useSlots();
const attrs = useAttrs();
const modalRef = useTemplateRef("modalRef");
const dragHandleRef = useTemplateRef("dragHandleRef");

// ─── Utils ─────────────────────────────────────────────────────────────────
function closeModal() {
  open.value = false;
  emit("close");
}

function toggleFullscreen(action?: "expand" | "minimize" | boolean) {
  if (action === "expand") {
    fullscreen.value = true;
    return;
  }
  if (action === "minimize") {
    fullscreen.value = false;
    return;
  }

  if (typeof action === "boolean") {
    fullscreen.value = action;
    return;
  }

  fullscreen.value = !fullscreen.value;
}

const { width: windowWidth, height: windowHeight } = useWindowSize();
onClickOutside(modalRef, () => {
  if (!dismissable) {
    emit("close:prevent");
    return;
  }
  closeModal();
});
onKeyStroke("Escape", closeModal);

const modalCenter = computed(() => {
  return {
    x: (windowWidth.value - (modalRef.value?.clientWidth ?? 0)) / 2,
    y: (windowHeight.value - (modalRef.value?.clientHeight ?? 0)) / 2
  };
});
const { style: dragElPosition } = useDraggable(modalRef, {
  initialValue: modalCenter,
  handle: () => dragHandleRef.value?.$el
});

const closeIcon = computed<IconName | null>(() => {
  if (close === false) return null;
  if (close === true || close === undefined) return "lucide:x";
  return close;
});

const computedDragIcon = computed<IconName | null>(() => {
  if (dragIcon === undefined) return "lucide:grip-vertical";
  return dragIcon;
});

const fullScreenIcon = computed<IconName | null>(() => {
  if (showFullScreenIcon) {
    return fullscreen.value ? "lucide:minimize" : "lucide:expand";
  }
  return null;
});

// ─── Modal classes ─────────────────────────────────────────────────────────

const modalClasses = computed(() =>
  twMerge(
    "flex flex-col bg-surface text-text shadow-2xl outline outline-2 outline-border z-100",
    "transition-all duration-300 ease-out",
    fullscreen.value ? "w-screen h-screen" : "w-full max-w-lg max-h-[90vh]",
    typeof attrs.class === "string" ? attrs.class : "",
    ui?.root ?? ""
  )
);

const modalStyle = computed(() => {
  if (fullscreen.value || !draggable) return "";
  return `${dragElPosition.value}; position: fixed`;
});
</script>

<template>
  <div>
    <!-- Trigger -->
    <span @click="open = true">
      <slot />
    </span>

    <Overlay :open :transparent="!overlay" :class="ui.overlay">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          v-if="open"
          ref="modalRef"
          :class="modalClasses"
          :style="modalStyle"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? 'modal-title' : undefined"
          :aria-describedby="description ? 'modal-desc' : undefined"
        >
          <slot name="content" :close="closeModal" :toggleFullscreen="toggleFullscreen">
            <!-- HEADER -->
            <div
              v-if="title || description || closeIcon || slots.header"
              :class="
                twMerge(
                  'flex items-start justify-between gap-4 p-5 shrink-0',
                  slots.body ? 'border-b-2 border-border' : '',
                  // draggable && !isFullscreen ? 'cursor-grab active:cursor-grabbing select-none' : '',
                  ui?.header
                )
              "
            >
              <slot name="header" :toggle-fullscreen="toggleFullscreen" :close="closeModal">
                <div class="flex flex-col gap-1 flex-1 min-w-0">
                  <div :class="icon ? 'flex items-center gap-1' : undefined">
                    <Icon v-if="icon" :name="icon" />
                    <h2
                      v-if="title"
                      id="modal-title"
                      :class="twMerge('text-lg font-semibold font-ui truncate', ui?.title)"
                    >
                      {{ title }}
                    </h2>
                  </div>
                  <p
                    v-if="description"
                    id="modal-desc"
                    :class="twMerge('text-sm text-muted leading-snug', ui?.description)"
                  >
                    {{ description }}
                  </p>
                </div>

                <div
                  v-if="closeIcon || draggable || computedDragIcon || fullScreenIcon"
                  class="flex items-center gap-1 shrink-0"
                >
                  <Button
                    v-if="fullScreenIcon"
                    color="neutral"
                    variant="ghost"
                    :icon="fullScreenIcon"
                    @click="toggleFullscreen"
                  />

                  <Button
                    v-if="draggable && computedDragIcon"
                    ref="dragHandleRef"
                    color="neutral"
                    variant="ghost"
                    :icon="computedDragIcon"
                  />
                  <Button
                    v-if="closeIcon"
                    color="neutral"
                    variant="ghost"
                    :icon="closeIcon"
                    @click="closeModal"
                  />
                </div>
              </slot>
            </div>

            <!-- BODY -->
            <div
              v-if="body || slots.body"
              :class="twMerge('flex-1 overflow-y-auto px-5 py-4', ui?.body)"
            >
              <slot name="body" :close="closeModal" :toggleFullscreen="toggleFullscreen">
                <p v-if="body" class="text-base text-text leading-relaxed">{{ body }}</p>
              </slot>
            </div>

            <!-- FOOTER -->
            <div
              v-if="actions.length > 0 || slots.footer"
              :class="
                twMerge('p-5 shrink-0', slots.body ? 'border-t-2 border-border' : '', ui?.footer)
              "
            >
              <slot name="footer" :toggleFullscreen="toggleFullscreen" :close="closeModal">
                <div class="flex items-center justify-end gap-4">
                  <Button v-for="(action, index) in actions" :key="index" v-bind="action" />
                </div>
              </slot>
            </div>
          </slot>
        </div>
      </Transition>
    </Overlay>
  </div>
</template>
