export interface CycleOptions {
  /**
   * Whether the cycle should restart when reaching the end.
   * @default true
   */
  infinite?: boolean;

  /**
   * Index to begin cycling from.
   * @default 0
   */
  startIndex?: number;

  /**
   * Step size between elements.
   * Useful for skipping elements.
   * @default 1
   */
  step?: number;
}

export interface Cycle<T> {
  /** Returns the next element and advances the cursor. */
  next(): T | undefined;

  /** Returns the previous element and moves the cursor backwards. */
  prev(): T | undefined;

  /** Returns the next element without advancing the cursor. */
  peek(): T | undefined;

  /** Returns the previous element without moving the cursor. */
  peekPrev(): T | undefined;

  /** Whether a next element exists (always true if `infinite`). */
  hasNext(): boolean;

  /** Whether a previous element exists (always true if `infinite`). */
  hasPrev(): boolean;

  /** Resets the cycle back to the starting index. */
  reset(): void;
}

/**
 * Creates a cycling iterator over a list.
 *
 * The returned object allows forward and backward traversal through the list.
 * By default the cycle is infinite, meaning it wraps around when reaching the
 * end or beginning of the list.
 *
 * @example
 * ```ts
 * const c = cycle(["a","b","c"]);
 *
 * c.next(); // "a"
 * c.next(); // "b"
 * c.prev(); // "a"
 * ```
 *
 * @example Finite cycle
 * ```ts
 * const c = cycle([1,2,3], { infinite: false });
 *
 * while (c.hasNext()) {
 *   console.log(c.next());
 * }
 * ```
 */
export function cycle<T>(list: readonly T[], options: CycleOptions = {}): Cycle<T> {
  const { infinite = true, startIndex = 0, step = 1 } = options;

  if (!Number.isInteger(step) || step === 0) {
    throw new Error("step must be a non-zero integer");
  }

  if (list.length === 0) {
    return {
      next: () => undefined,
      prev: () => undefined,
      peek: () => undefined,
      peekPrev: () => undefined,
      hasNext: () => false,
      hasPrev: () => false,
      reset: () => void 0
    };
  }

  const mod = (n: number) => ((n % list.length) + list.length) % list.length;

  const normalizedStart = mod(startIndex);
  let index = normalizedStart;

  // track how many steps taken to correctly gate finite hasPrev
  let stepsTaken = 0;

  function hasNext(): boolean {
    return infinite || index < list.length;
  }

  function hasPrev(): boolean {
    return infinite || stepsTaken > 0;
  }

  function peek(): T | undefined {
    if (!hasNext()) return undefined;
    return list[mod(index)];
  }

  function peekPrev(): T | undefined {
    if (!hasPrev()) return undefined;
    return list[mod(index - step)];
  }

  function next(): T | undefined {
    if (!hasNext()) return undefined;
    const value = list[mod(index)];
    index += step;
    stepsTaken++;
    return value;
  }

  function prev(): T | undefined {
    if (!hasPrev()) return undefined;
    index -= step;
    stepsTaken--;
    return list[mod(index)];
  }

  function reset() {
    index = normalizedStart;
    stepsTaken = 0;
  }

  return { next, prev, peek, peekPrev, hasNext, hasPrev, reset };
}
