import { normalize } from "node:path";

export function normalizePath(filePath: string): string {
  return normalize(filePath).replace(/\\/g, "/");
}
