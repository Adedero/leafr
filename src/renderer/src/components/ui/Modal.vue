<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from "reka-ui";
import type { UIAction } from "@renderer/types/ui.type";
import Icon, { type IconName } from "./Icon.vue";
import Button from "./Button.vue";
import { twMerge } from "tailwind-merge";

// ─── Types ──────────────────────────────────────────────────────────────────

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
  dismissible?: boolean;
  overlay?: boolean;
  close?: IconName | boolean;
  actions?: UIAction[];
  draggable?: boolean;
  dragIcon?: IconName;
  showFullScreenIcon?: boolean;
  ui?: ModalUI;
}

// ─── Props / emits / models ──────────────────────────────────────────────────

const {
  title = undefined,
  icon = undefined,
  description = undefined,
  body = undefined,
  dismissible = true,
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

// ─── Sync body scroll & emit lifecycle ──────────────────────────────────────

watch(open, (val) => {
  document.body.style.overflow = val ? "hidden" : "";
  if (val) emit("open");
});

// ─── Slots / attrs / refs ────────────────────────────────────────────────────

const slots = useSlots();
const attrs = useAttrs();
const modalRef = useTemplateRef("modalRef");
const dragHandleRef = useTemplateRef("dragHandleRef");

// ─── Close / fullscreen helpers ──────────────────────────────────────────────

function closeModal() {
  open.value = false;
  emit("close");
}

function handleDismiss(e: Event) {
  if (!dismissible) {
    e.preventDefault();
    emit("close:prevent");
  }
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

// ─── Draggable ───────────────────────────────────────────────────────────────

const { width: windowWidth, height: windowHeight } = useWindowSize();

const modalCenter = computed(() => ({
  x: (windowWidth.value - (modalRef.value?.clientWidth ?? 0)) / 2,
  y: (windowHeight.value - (modalRef.value?.clientHeight ?? 0)) / 2
}));

const { style: dragElPosition } = useDraggable(modalRef, {
  initialValue: modalCenter,
  handle: () => dragHandleRef.value?.$el
});

// ─── Computed icons ──────────────────────────────────────────────────────────

const closeIcon = computed<IconName | null>(() => {
  if (close === false) return null;
  if (close === true || close === undefined) return "lucide:x";
  return close;
});

const computedDragIcon = computed<IconName | null>(() =>
  dragIcon === undefined ? "lucide:grip-vertical" : dragIcon
);

const fullScreenIcon = computed<IconName | null>(() =>
  showFullScreenIcon
    ? fullscreen.value
      ? "lucide:minimize"
      : "lucide:expand"
    : null
);

// ─── Classes / styles ────────────────────────────────────────────────────────

const contentClasses = computed(() =>
  twMerge(
    "top-1/2 left-1/2 fixed -translate-x-1/2 -translate-y-1/2",
    "flex flex-col bg-surface text-text shadow-2xl outline outline-2 outline-border z-[120]",
    "transition-all duration-300 ease-out",
    
    fullscreen.value ? "w-screen h-screen" : "w-full max-w-lg max-h-[90vh]",
    // Reka UI positions DialogContent with fixed+translate by default;
    // override when draggable so useDraggable controls position instead.
    draggable && !fullscreen.value ? "!transform-none" : "",
    typeof attrs.class === "string" ? attrs.class : "",
    ui?.root ?? ""
  )
);

const contentStyle = computed(() =>
  draggable && !fullscreen.value
    ? `${dragElPosition.value}; position: fixed`
    : undefined
);

const overlayClasses = computed(() =>
  twMerge(
    "z-50 fixed inset-0",
    overlay ? "bg-black/50" : "bg-transparent",
    ui?.overlay
  )
);
</script>

<template>
  <DialogRoot v-model:open="open">
    <!-- Trigger ──────────────────────────────────────────────────────────── -->
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>

    <DialogPortal>
      <!-- Overlay ────────────────────────────────────────────────────────── -->
      <DialogOverlay :class="overlayClasses" />

      <!-- Content ────────────────────────────────────────────────────────── -->
      <DialogContent
        ref="modalRef"
        :class="contentClasses"
        :style="contentStyle"
        :aria-labelledby="title ? 'modal-title' : undefined"
        :aria-describedby="description ? 'modal-desc' : undefined"
        @pointer-down-outside="handleDismiss"
        @escape-key-down="handleDismiss"
        @interact-outside="handleDismiss"
      >
        <slot
          name="content"
          :close="closeModal"
          :toggle-fullscreen="toggleFullscreen"
        >
          <!-- HEADER ─────────────────────────────────────────────────────── -->
          <div
            v-if="title || description || closeIcon || slots.header"
            :class="
              twMerge(
                'flex justify-between items-start gap-4 p-5 shrink-0',
                slots.body ? 'border-b-2 border-border' : '',
                ui?.header
              )
            "
          >
            <slot
              name="header"
              :toggle-fullscreen="toggleFullscreen"
              :close="closeModal"
            >
              <div class="flex flex-col flex-1 gap-1 min-w-0">
                <div :class="icon ? 'flex items-center gap-1' : undefined">
                  <Icon v-if="icon" :name="icon" />
                  <DialogTitle
                    v-if="title"
                    id="modal-title"
                    :class="
                      twMerge(
                        'font-ui font-semibold text-lg truncate',
                        ui?.title
                      )
                    "
                  >
                    {{ title }}
                  </DialogTitle>
                </div>
                <DialogDescription
                  v-if="description"
                  id="modal-desc"
                  :class="
                    twMerge('text-muted text-sm leading-snug', ui?.description)
                  "
                >
                  {{ description }}
                </DialogDescription>
              </div>

              <div
                v-if="closeIcon || draggable || fullScreenIcon"
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
                <!-- Use Reka's DialogClose so Esc/close is properly wired -->
                <DialogClose v-if="closeIcon" as-child @click="emit('close')">
                  <Button
                    color="neutral"
                    variant="ghost"
                    :icon="closeIcon"
                    :class="ui?.close"
                  />
                </DialogClose>
              </div>
            </slot>
          </div>

          <!-- BODY ───────────────────────────────────────────────────────── -->
          <div
            v-if="body || slots.body"
            :class="twMerge('flex-1 overflow-y-auto px-5 py-4', ui?.body)"
          >
            <slot
              name="body"
              :close="closeModal"
              :toggle-fullscreen="toggleFullscreen"
            >
              <p v-if="body" class="text-text text-base leading-relaxed">
                {{ body }}
              </p>
            </slot>
          </div>

          <!-- FOOTER ─────────────────────────────────────────────────────── -->
          <div
            v-if="actions.length > 0 || slots.footer"
            :class="
              twMerge(
                'p-5 shrink-0',
                slots.body ? 'border-t-2 border-border' : '',
                ui?.footer
              )
            "
          >
            <slot
              name="footer"
              :toggle-fullscreen="toggleFullscreen"
              :close="closeModal"
            >
              <div class="flex justify-end items-center gap-4">
                <Button
                  v-for="(action, index) in actions"
                  :key="index"
                  v-bind="action"
                />
              </div>
            </slot>
          </div>
        </slot>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
