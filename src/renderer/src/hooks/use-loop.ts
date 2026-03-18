// use-loop.ts
import { ref, onUnmounted, readonly, type Ref, onMounted } from "vue";

export interface LoopOptions {
  interval?: number; // ms between each item, default 3000
  mode?: "random" | "sequential";
  infinite?: boolean; // default true, if false stops at last item
  repeat?: boolean; // default true, if false each item shows once
  immediate?: boolean; // default true, show first item immediately
  onEnd?: () => void; // called when loop ends (infinite: false + all shown)
}

export interface LoopReturn<T> {
  current: Ref<T | null>;
  index: Readonly<Ref<number>>;
  isRunning: Readonly<Ref<boolean>>;
  isDone: Readonly<Ref<boolean>>;
  progress: Readonly<Ref<number>>; // 0-1, how far through the array
  start: () => void;
  stop: () => void;
  reset: () => void;
  next: () => void; // manually advance
}

export default function useLoop<T>(items: readonly T[], options: LoopOptions = {}): LoopReturn<T> {
  const {
    interval = 3000,
    mode = "sequential",
    infinite = true,
    repeat = true,
    immediate = true,
    onEnd
  } = options;

  const current = ref<T | null>(null) as Ref<T | null>;
  const index = ref(-1);
  const isRunning = ref(false);
  const isDone = ref(false);

  // Tracks which indices have been shown (for repeat: false)
  const seen = new Set<number>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const progress = ref(0);

  function getNextIndex(): number | null {
    if (mode === "sequential") {
      const next = index.value + 1;
      if (next >= items.length) {
        if (infinite) {
          // If repeat: false and we've seen everything, we're done
          if (!repeat && seen.size >= items.length) return null;
          return 0;
        }
        return null;
      }
      return next;
    }

    // Random mode
    const available = items.map((_, i) => i).filter((i) => repeat || !seen.has(i));

    if (available.length === 0) {
      if (infinite && repeat) {
        // Reset seen and pick from all
        seen.clear();
        return Math.floor(Math.random() * items.length);
      }
      return null;
    }

    // Don't show the same item twice in a row if possible
    const pool = available.length > 1 ? available.filter((i) => i !== index.value) : available;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  function pick(i: number) {
    index.value = i;
    current.value = items[i];
    seen.add(i);
    progress.value = seen.size / items.length;
  }

  function scheduleNext() {
    timer = setTimeout(() => {
      next();
    }, interval);
  }

  function next() {
    const nextIndex = getNextIndex();

    if (nextIndex === null) {
      isDone.value = true;
      isRunning.value = false;
      onEnd?.();
      return;
    }

    pick(nextIndex);
    if (isRunning.value) scheduleNext();
  }

  function start() {
    if (isRunning.value) return;
    isRunning.value = true;
    isDone.value = false;

    // Always pick immediately when start() is called
    if (index.value === -1) {
      const firstIndex = mode === "random" ? Math.floor(Math.random() * items.length) : 0;
      pick(firstIndex);
    }

    scheduleNext();
  }
  function stop() {
    isRunning.value = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function reset() {
    stop();
    seen.clear();
    index.value = -1;
    current.value = null;
    isDone.value = false;
    progress.value = 0;
  }

  onMounted(() => {
    if (immediate) {
      start();
    }
  });

  onUnmounted(() => {
    stop();
  });

  return {
    current,
    index: readonly(index),
    isRunning: readonly(isRunning),
    isDone: readonly(isDone),
    progress: readonly(progress),
    start,
    stop,
    reset,
    next
  };
}
