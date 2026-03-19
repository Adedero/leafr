export function decimalPoints(value: number): number {
  return value.toString().split(".")[1].length;
}
