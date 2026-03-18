import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { extractLabels } from "./extract-labels";

export interface CollectEpubFilesAndLabelsReturn {
  fileName: string;
  filePath: string;
  labels: string[];
}
/** Recursively collect all .epub files under a directory */
export async function collectEpubFilesAndLabels(
  dir: string,
  rootDir: string = dir // preserve original root across recursion
): Promise<CollectEpubFilesAndLabelsReturn[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: CollectEpubFilesAndLabelsReturn[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectEpubFilesAndLabels(fullPath, rootDir)));
    } else if (entry.isFile() && entry.name.endsWith(".epub")) {
      results.push({
        fileName: entry.name,
        filePath: fullPath,
        labels: extractLabels(rootDir, fullPath)
      });
    }
  }

  return results;
}
