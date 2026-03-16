<script setup lang="ts">
import { UIAction } from "@renderer/types/ui.type";
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { IconName } from "./Icon.vue";
import { OVERLAY_WRAPPER_ID } from "@renderer/constants/ui";

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
  description?: string;
  body?: string;
  dismissable?: boolean;
  overlay?: boolean;
  close?: IconName | boolean;
  actions?: UIAction[];
  draggable?: boolean;
  fullscreen?: boolean;
  ui?: ModalUI;
}

const props = withDefaults(defineProps<Props>(), {
  dismissable: true,
  overlay: true,
  close: true,
  draggable: true,
  fullscreen: false
});

const emit = defineEmits<{
  open: [];
  close: [];
  expand: [];
  minimize: [];
}>();

const open = defineModel<boolean>("open", { default: false });

// ─── Fullscreen state ──────────────────────────────────────────────────────

const isFullscreen = ref(props.fullscreen);

const expand = () => {
  isFullscreen.value = true;
  emit("expand");
};

const minimize = () => {
  isFullscreen.value = false;
  emit("minimize");
};

const toggleFullscreen = () => {
  isFullscreen.value ? minimize() : expand();
};

defineExpose({ expand, minimize, toggleFullscreen });

// ─── Close ─────────────────────────────────────────────────────────────────

const closeModal = () => {
  open.value = false;
  emit("close");
};

const onOverlayClick = () => {
  if (props.dismissable) closeModal();
};

// ─── Keyboard ──────────────────────────────────────────────────────────────

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && open.value && props.dismissable) closeModal();
};

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

// ─── Body scroll lock ──────────────────────────────────────────────────────

watch(open, (val) => {
  document.body.style.overflow = val ? "hidden" : "";
  if (val) emit("open");
});

// ─── Dragging ──────────────────────────────────────────────────────────────

const modalRef = ref<HTMLElement | null>(null);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);

const onDragStart = (e: MouseEvent) => {
  if (!props.draggable || isFullscreen.value) return;
  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  };
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);
};

const onDragMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  position.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y
  };
};

const onDragEnd = () => {
  isDragging.value = false;
  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("mouseup", onDragEnd);
};

// ─── Close icon ────────────────────────────────────────────────────────────

const closeIcon = computed<IconName | null>(() => {
  if (props.close === false) return null;
  if (props.close === true || props.close === undefined) return "lucide:x";
  return props.close;
});

// ─── Modal classes ─────────────────────────────────────────────────────────

const modalClasses = computed(() => [
  "flex flex-col bg-surface text-text shadow-2xl outline outline-1 outline-border z-100",
  "transition-all duration-300 ease-out",
  isFullscreen.value ? "w-screen h-screen rounded-none" : "w-full max-w-lg max-h-[90vh] rounded-xl",
  props.ui?.root ?? ""
]);

const modalStyle = computed(() => {
  if (isFullscreen.value || !props.draggable) return {};
  return {
    transform: `translate(${position.value.x}px, ${position.value.y}px)`,
    cursor: isDragging.value ? "grabbing" : undefined
  };
});
</script>

<template>
  <div>
    <!-- Trigger -->
    <span @click="open = true">
      <slot />
    </span>

    <Teleport to="#__overlay__">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
          <!-- Overlay -->
          <div
            :class="[
              'absolute inset-0',
              overlay ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent',
              ui?.overlay
            ]"
            @click="onOverlayClick"
          />

          <!-- Modal -->
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
              <!-- Header -->
              <div
                v-if="title || description || closeIcon || $slots.header"
                :class="[
                  'flex items-start justify-between gap-4 px-5 pt-5 pb-4 shrink-0',
                  'border-b border-border',
                  draggable && !isFullscreen
                    ? 'cursor-grab active:cursor-grabbing select-none'
                    : '',
                  ui?.header
                ]"
                @mousedown="onDragStart"
              >
                <slot
                  name="header"
                  :expand="expand"
                  :minimize="minimize"
                  :toggle-fullscreen="toggleFullscreen"
                  :close="closeModal"
                >
                  <div class="flex flex-col gap-1 flex-1 min-w-0">
                    <h2
                      v-if="title"
                      id="modal-title"
                      :class="['text-base font-semibold font-ui truncate', ui?.title]"
                    >
                      {{ title }}
                    </h2>
                    <p
                      v-if="description"
                      id="modal-desc"
                      :class="['text-sm text-muted leading-snug', ui?.description]"
                    >
                      {{ description }}
                    </p>
                  </div>
                </slot>

                <!-- Header actions: fullscreen + close -->
                <div class="flex items-center gap-1 shrink-0">
                  <slot
                    name="header-actions"
                    :expand="expand"
                    :minimize="minimize"
                    :toggle-fullscreen="toggleFullscreen"
                    :close="closeModal"
                    :is-fullscreen="isFullscreen"
                  >
                    <button
                      class="p-1.5 rounded-md text-muted hover:text-text hover:bg-text/10 transition-colors"
                      @click="toggleFullscreen"
                    >
                      <Icon
                        :name="isFullscreen ? 'lucide:minimize-2' : 'lucide:maximize-2'"
                        class="size-4"
                      />
                    </button>
                  </slot>

                  <button
                    v-if="closeIcon"
                    :class="[
                      'p-1.5 rounded-md text-muted hover:text-text hover:bg-text/10 transition-colors',
                      ui?.close
                    ]"
                    @click="closeModal"
                  >
                    <Icon :name="closeIcon" class="size-4" />
                  </button>
                </div>
              </div>

              <!-- Body -->
              <div :class="['flex-1 overflow-y-auto px-5 py-4', ui?.body]">
                <slot
                  name="body"
                  :expand="expand"
                  :minimize="minimize"
                  :close="closeModal"
                  :is-fullscreen="isFullscreen"
                >
                  <p v-if="body" class="text-sm text-text leading-relaxed">{{ body }}</p>
                </slot>
              </div>

              <!-- Footer -->
              <div
                v-if="actions?.length || $slots.footer"
                :class="[
                  'flex items-center justify-end gap-2 px-5 py-4 shrink-0',
                  'border-t border-border',
                  ui?.footer
                ]"
              >
                <slot
                  name="footer"
                  :expand="expand"
                  :minimize="minimize"
                  :close="closeModal"
                  :is-fullscreen="isFullscreen"
                >
                  <Button
                    v-for="action in actions"
                    :key="action.label"
                    :color="action.color ?? 'neutral'"
                    :variant="(action.variant as any) ?? 'outlined'"
                    :label="action.label"
                    :icon="action.icon"
                    :trailing-icon="action.trailingIcon"
                    :loading="action.loading"
                    :disabled="action.disabled"
                    @click="action.onClick?.()"
                  />
                </slot>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
