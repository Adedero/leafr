export interface LoopOptions {
  /**
   * Whether iteration should wrap back to the start after reaching the end.
   * @default true
   */
  infinite?: boolean;

  /**
   * Index to begin looping from.
   * Values outside the list length will wrap correctly.
   * @default 0
   */
  startIndex?: number;

  /**
   * Step size between elements.
   * For example, `step: 2` returns every second element.
   * @default 1
   */
  step?: number;
}

/**
 * A callable function that returns the next item in the loop.
 */
export type Loop<T> = () => T | undefined;

/**
 * Creates a looping accessor for a list.
 *
 * Each time the returned function is called, the next element in the list
 * is returned. By default the loop is infinite and wraps back to the
 * beginning when the end is reached.
 *
 * @example
 * ```ts
 * const next = loop(["a", "b", "c"]);
 *
 * next(); // "a"
 * next(); // "b"
 * next(); // "c"
 * next(); // "a"
 * ```
 *
 * @example Finite loop
 * ```ts
 * const next = loop([1,2,3], { infinite: false });
 *
 * next(); // 1
 * next(); // 2
 * next(); // 3
 * next(); // undefined
 * ```
 *
 * @example Using a step
 * ```ts
 * const next = loop(["a","b","c","d"], { step: 2 });
 *
 * next(); // "a"
 * next(); // "c"
 * next(); // "a"
 * ```
 */
export default function loop<T>(list: readonly T[], options: LoopOptions = {}): Loop<T> {
  const { infinite = true, startIndex = 0, step = 1 } = options;

  if (!Number.isInteger(step) || step === 0) {
    throw new Error("step must be a non-zero integer");
  }

  if (list.length === 0) return () => undefined;

  const mod = (n: number) => ((n % list.length) + list.length) % list.length;

  let index = mod(startIndex);

  return () => {
    const outOfBounds = step > 0 ? index >= list.length : index < 0;
    if (!infinite && outOfBounds) return undefined;

    const value = list[mod(index)];
    index += step;
    return value;
  };
}
