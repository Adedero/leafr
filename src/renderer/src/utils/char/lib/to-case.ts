/**
 * Supported string case transformations.
 */
export type StringCase = "upper" | "lower" | "capitalize";

/**
 * Converts a string to a specific case format.
 *
 * @param str - The input string to transform.
 * @param caseType - The case transformation to apply.
 * Defaults to `"lower"`.
 *
 * @returns The transformed string.
 *
 * @example
 * toCase("hello", "upper")
 * // "HELLO"
 *
 * @example
 * toCase("HELLO", "lower")
 * // "hello"
 *
 * @example
 * toCase("hello world", "capitalize")
 * // "Hello world"
 */
export default function toCase(str: string, caseType: StringCase = "lower"): string {
  if (!str) return "";

  switch (caseType) {
    case "upper":
      return str.toUpperCase();

    case "capitalize":
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    case "lower":
    default:
      return str.toLowerCase();
  }
}
