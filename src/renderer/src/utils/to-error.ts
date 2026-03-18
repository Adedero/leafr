/**
 * Converts anything to a real Error instance.
 *
 * @example
 * try {
 *   ...
 * } catch (e) {
 *   throw toError(e)       // rethrow as real Error
 *   console.error(toError(e).message)
 * }
 */
export function toError(value: unknown): Error {
  // already an Error — return as-is
  if (value instanceof Error) return value;

  // string
  if (typeof value === "string") {
    return new Error(value || "An unknown error occurred");
  }

  // object with message property
  if (isObjectWithMessage(value)) {
    const err = new Error(String(value.message));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err.cause = (value as any).cause;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err.stack = (value as any).stack ?? err.stack;
    return err;
  }

  // number or boolean — throw 404, throw false
  if (typeof value === "number" || typeof value === "boolean") {
    return new Error(String(value));
  }

  // plain object — serialize it
  if (typeof value === "object" && value !== null) {
    const err = new Error(trySerialize(value));
    err.cause = value;
    return err;
  }

  // null, undefined, symbol, etc.
  return new Error("An unknown error occurred");
}

/**
 * Like toError but returns just the message string.
 */
export function toErrorMessage(value: unknown): string {
  return toError(value).message;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function isObjectWithMessage(value: unknown): value is { message: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (value as any).message === "string"
  );
}

function trySerialize(value: object): string {
  try {
    const str = JSON.stringify(value);
    return str === "{}" ? "An unknown error occurred" : str;
  } catch {
    return "An unknown error occurred";
  }
}
