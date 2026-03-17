export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = { leading: true, trailing: false }
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let lastCallTime = 0;

  const invoke = () => {
    if (lastArgs) {
      func.apply(lastThis, lastArgs);
      lastCallTime = Date.now();
      lastArgs = lastThis = null;
    }
  };

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastCallTime);

    lastArgs = args;
    lastThis = this;

    if (options.leading && remaining <= 0) {
      invoke();
    } else if (options.trailing) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(invoke, Math.max(0, remaining));
    }
  };
}
