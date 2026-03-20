import { basename, join, normalize } from "node:path";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import db, { table } from "../../database";
import getLibPath from "../../utils/get-lib-path";
import { hashFile } from "../../utils/hash-file";
import { pathExists } from "../../utils/path-exists";
import { extractLabels } from "../../utils/epub-utils/extract-labels";
import { syncSingleFile } from "../../utils/epub-utils/sync-single-file";
import { eq } from "drizzle-orm";
import { normalizePath } from "../../utils/normalize-path";
import { syncDirLabels } from "../../utils/epub-utils/sync-dir-labels";
import logger from "../../utils/logger";

/**
 * Handles files opened via dialog or drag-and-drop.
 * If the file is outside the library, it's copied into it.
 * Then it's synced to the database.
 * Returns the IDs of the books.
 */
export default async function saveOpenedFiles(
  paths: string[]
): Promise<string[]> {
  const libDir = await getLibPath();
  const bookIds: string[] = [];

  for (const path of paths) {
    try {
      const id = await saveSingleFile(path, libDir);
      if (id) {
        bookIds.push(id);
      }
    } catch (error) {
      logger.error(`Failed to save opened file: ${path}`, error);
    }
  }

  return bookIds;
}

async function saveSingleFile(
  filePath: string,
  libDir: string
): Promise<string | undefined> {
  if (!filePath.endsWith(".epub")) return undefined;

  const hash = hashFile(filePath);
  const normalizedLibDir = normalize(libDir);
  let currentPath = normalize(filePath);

  // 1. Check if file is outside libDir, if so copy it
  const isInsideLib = currentPath.startsWith(normalizedLibDir);

  if (!isInsideLib) {
    const fileName = basename(filePath);
    let targetPath = join(normalizedLibDir, fileName);

    if (await pathExists(targetPath)) {
      const existingHash = hashFile(targetPath);
      if (existingHash !== hash) {
        targetPath = join(
          normalizedLibDir,
          `${basename(fileName, ".epub")}-${hash.slice(0, 6)}.epub`
        );
      }
    }

    if (!(await pathExists(targetPath))) {
      await mkdir(dirname(targetPath), { recursive: true });
      await copyFile(filePath, targetPath);
    }
    currentPath = targetPath;
  }

  // 2. Check if we already have this file by hash
  const existingByHash = await db.query.books.findFirst({
    where: { fileHash: hash },
    columns: { id: true, filePath: true }
  });

  if (existingByHash) {
    if (normalize(existingByHash.filePath) !== currentPath) {
      // Path changed, update it and re-sync labels
      await db
        .update(table.books)
        .set({
          filePath: currentPath,
          fileURL: normalizePath(currentPath),
          updatedAt: new Date().toISOString()
        })
        .where(eq(table.books.id, existingByHash.id));

      const labels = extractLabels(libDir, currentPath);
      await syncDirLabels(existingByHash.id, labels);
    }
    return existingByHash.id;
  }

  // 3. Sync as a new file
  const labels = extractLabels(libDir, currentPath);
  const result = await syncSingleFile({
    filePath: currentPath,
    fileHash: hash,
    labels
  });

  if (result.type === "error") return undefined;

  return result.bookId;
}
