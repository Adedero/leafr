import type { MaybeRefOrGetter } from "vue";

export type WheelDirection = "up" | "down" | "left" | "right";

export interface WheelGesture {
  direction: WheelDirection;
  axis: "x" | "y";
  dir: 1 | -1;
  event: WheelEvent;
}

interface WheelOptions {
  threshold?: number;
  cooldown?: number;
  passive?: boolean;
  onGesture: (gesture: WheelGesture) => void;
}

type TargetEl = MaybeRefOrGetter<Window | Document | HTMLElement | null>;

export default function useWheel(el: TargetEl | TargetEl[], options: WheelOptions) {
  const threshold = options.threshold ?? 80;
  const cooldown = options.cooldown ?? 350;
  const passive = options.passive ?? false;

  let deltaX = 0;
  let deltaY = 0;
  let locked = false;

  function resolveGesture(e: WheelEvent): WheelGesture {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const dir = deltaX > 0 ? 1 : -1;
      return { direction: dir === 1 ? "right" : "left", axis: "x", dir, event: e };
    } else {
      const dir = deltaY > 0 ? 1 : -1;
      return { direction: dir === 1 ? "down" : "up", axis: "y", dir, event: e };
    }
  }

  function onWheel(event: Event) {
    const e = event as WheelEvent;
    if (!passive) e.preventDefault();
    if (locked) return;

    deltaX += e.deltaX;
    deltaY += e.deltaY;

    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return;

    locked = true;
    options.onGesture(resolveGesture(e));
    deltaX = 0;
    deltaY = 0;

    setTimeout(() => (locked = false), cooldown);
  }

  onMounted(() => {
    const els = Array.isArray(el) ? el : [el];
    els.forEach((e) => toValue(e)?.addEventListener("wheel", onWheel, { passive }));
  });

  onUnmounted(() => {
    const els = Array.isArray(el) ? el : [el];
    els.forEach((e) => toValue(e)?.removeEventListener("wheel", onWheel));
  });

  return {
    onWheel
  };
}
