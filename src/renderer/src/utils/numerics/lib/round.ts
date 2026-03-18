/**
 * Rounds a number to a given number of decimal places.
 * Uses the "round half away from zero" strategy.
 */
export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
