import { dirname, relative } from "node:path";
/**
 * Extract all parent directory names between the library root and the file
 * as normalized labels.
 * e.g. root=/lib, file=/lib/Sci-Fi/Author/book.epub → ["Sci Fi", "Author"]
 */
export function extractLabels(rootDir: string, filePath: string): string[] {
  const rel = relative(rootDir, dirname(filePath));
  if (!rel || rel === ".") return [];
  return rel.split(/[\\/]/).map(normalizeLabel).filter(Boolean);
}

/** Normalize a directory name into a clean label */
export function normalizeLabel(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

