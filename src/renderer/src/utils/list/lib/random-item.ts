/**
 * Returns a random element from an array.
 * Returns undefined if the array is empty.
 * * @param items - An array of items of type T
 * @returns A single item of type T or undefined
 */
export function randomItem<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}
