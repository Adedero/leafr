import type { MaybeRefOrGetter } from "vue";

export type ClickZone = "left" | "right" | "center";
export type ClickZoneTarget = Element | Window | Document | null | undefined;

export interface UseClickZoneOptions {
  threshold?: number;
  tapSlop?: number;
  ignore?: MaybeRefOrGetter<Element | string | null>[];
  onZone?: (zone: ClickZone, event: PointerEvent) => void;
}

export function useClickZone(
  el: MaybeRefOrGetter<ClickZoneTarget>,
  options: UseClickZoneOptions = {}
) {
  const { threshold = 0.25, tapSlop = 8, onZone, ignore = [] } = options;
  const element = () => toValue(el);

  let startX = 0;
  let startY = 0;
  const rect = ref<DOMRect | null>(null);
  const zone = ref<ClickZone | null>(null);

  function getRect(target: ClickZoneTarget): DOMRect | null {
    if (!target) return null;
    // Window and Document span the full viewport
    if (target === window || target === document) {
      return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    }
    return (target as Element).getBoundingClientRect();
  }

  const onPointerDown = (e: Event) => {
    const event = e as PointerEvent;
    if (!event.isPrimary) return;
    if (isIgnored(event.target)) return;
    rect.value = getRect(element());
    startX = event.clientX;
    startY = event.clientY;
  };

  const onPointerUp = (e: Event) => {
    const event = e as PointerEvent;
    if (isIgnored(event.target)) return;
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isIgnored(event.target)) return;

    const dx = Math.abs(event.clientX - startX);
    const dy = Math.abs(event.clientY - startY);
    if (dx > tapSlop || dy > tapSlop) return;
    if (!rect.value) return;

    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.value.left) / rect.value.width));

    if (ratio < threshold) zone.value = "left";
    else if (ratio > 1 - threshold) zone.value = "right";
    else zone.value = "center";

    e.preventDefault();
    onZone?.(zone.value, event);
  };

  function isIgnored(target: EventTarget | null) {
    if (!(target instanceof Node)) return false;
    return ignore.some((el) => {
      const ignored = toValue(el);
      if (typeof ignored === "string") {
        return target instanceof Element && target.closest(ignored);
      }
      return ignored?.contains(target);
    });
  }

  watch(
    element,
    (target, _, onCleanup) => {
      if (!target) return;
      target.addEventListener("pointerdown", onPointerDown);
      target.addEventListener("pointerup", onPointerUp);
      onCleanup(() => {
        target.removeEventListener("pointerdown", onPointerDown);
        target.removeEventListener("pointerup", onPointerUp);
      });
    },
    { immediate: true }
  );

  onUnmounted(() => {
    const target = element();
    if (!target) return;
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointerup", onPointerUp);
  });

  return { zone, onPointerDown, onPointerUp };
}
