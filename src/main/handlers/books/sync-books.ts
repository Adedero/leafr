import getLibPath from "../../utils/get-lib-path";
import db, { table } from "../../database";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { hashFile } from "../../utils/hash-file";
import { normalizePath } from "../../utils/normalize-path";
import { EPub } from "epub";
import logger from "../../utils/logger";
import type { NewBook } from "../../database/schema";
import { collectEpubFilesAndLabels } from "../../utils/epub-utils/collect-epub-files-and-labels";
import { extractCover } from "../../utils/epub-utils/extract-cover";
import { removeBook } from "../../utils/epub-utils/remove-book";
import { syncDirLabels } from "../../utils/epub-utils/sync-dir-labels";

export type SyncBooksReturn = {
  added: string[];
  removed: string[];
  renamed: string[];
  scanned: number;
};

export default async function syncBooks() {
  const dir = await getLibPath();

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

      const epub = new EPub(filePath);
      await epub.parse();

      const { metadata } = epub;
      const cover = await extractCover(epub, fileHash);

      try {
        if (!cover) {
          throw new Error("No cover found");
        }
        await writeFile(cover.path, cover.data);
      } catch (error) {
        logger.error(`Failed to extract cover for ${filePath}`, error);
      }

      const newBook: NewBook = {
        filePath: filePath,
        fileURL: normalizePath(filePath),
        fileHash,
        title: metadata.title,
        author: metadata.creator,
        description: metadata.description,
        coverImagePath: cover?.path ? normalizePath(cover.path) : null,
        language: metadata.language,
        publisher: metadata.publisher,
        publishedDate: metadata.date,
        addedAt: new Date().toISOString()
      };

      const [inserted] = await db.insert(table.books).values(newBook).returning();
      await syncDirLabels(inserted.id, labels);
      added.push(filePath);
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
