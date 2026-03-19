import getLibPath from "../../utils/get-lib-path";
import db, { table } from "../../database";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { hashFile } from "../../utils/hash-file";
import logger from "../../utils/logger";
import { collectEpubFilesAndLabels } from "../../utils/epub-utils/collect-epub-files-and-labels";
import { removeBook } from "../../utils/epub-utils/remove-book";
import { syncDirLabels } from "../../utils/epub-utils/sync-dir-labels";
import { syncSingleFile } from "../../utils/epub-utils/sync-single-file";

export type SyncBooksReturn = {
  added: string[];
  removed: string[];
  renamed: string[];
  scanned: number;
};

export default async function syncBooks(rootDir?: string) {
  const dir = rootDir || (await getLibPath());

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const [diskFiles, dbBooks] = await Promise.all([
    collectEpubFilesAndLabels(dir),
    db
      .select({
        id: table.books.id,
        fileHash: table.books.fileHash,
        filePath: table.books.filePath,
        coverImagePath: table.books.coverImagePath
      })
      .from(table.books)
  ]);

  const added: string[] = [];
  const removed: string[] = [];
  const renamed: string[] = [];

  const hashMap = new Map(dbBooks.map((b) => [b.fileHash, b]));
  const pathSet = new Set(diskFiles.map((f) => f.filePath));

  for (const { filePath, labels } of diskFiles) {
    try {
      const fileHash = hashFile(filePath);
      const existing = hashMap.get(fileHash);

      if (existing) {
        if (existing.filePath !== filePath) {
          // file has been renamed or moved. Update path and labels
          await db
            .update(table.books)
            .set({ filePath: filePath })
            .where(eq(table.books.id, existing.id));
          renamed.push(filePath);
        }
        await syncDirLabels(existing.id, labels);
        continue;
      }

      try {
        const result = await syncSingleFile({ filePath, fileHash, labels });
        if (result.type === "added") added.push(result.filePath);
        if (result.type === "renamed") renamed.push(result.filePath);
      } catch (error) {
        logger.error(`Failed to sync book ${filePath}`, error);
        throw error;
      }
    } catch (e) {
      logger.error(`Failed to sync book ${filePath}`, e);
    }

    for (const book of dbBooks) {
      if (!pathSet.has(book.filePath)) {
        try {
          await removeBook(book);
          removed.push(book.filePath);
        } catch (e) {
          logger.error(`Failed to remove missing book ${book.filePath}`, e);
        }
      }
    }
  }
  return {
    added,
    removed,
    renamed,
    scanned: diskFiles.length
  };
}
