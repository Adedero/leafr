export function collapseWhitespace(str: string): string {
  return str.trim().replace(/\s+/g, " ");
}
