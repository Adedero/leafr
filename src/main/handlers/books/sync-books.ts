import getLibPath from "../../utils/get-lib-path";
import db, { table } from "../../database";
import { existsSync } from "node:fs";
import { mkdir, readdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { hashFile } from "../../utils/hash-file";
import { COVER_IMAGE_PATH } from "../../utils/constants";
import { normalizePath } from "../../utils/normalize-path";
import { EPub } from "epub";
import logger from "../../utils/logger";
import { NewBook } from "../../database/schema";

export type SyncBooksReturn = {
  added: string[];
  removed: string[];
  renamed: string[];
  scanned: number;
};

export default async function syncBooks(): Promise<SyncBooksReturn> {
  const dir = await getLibPath();

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const diskFiles = (await readdir(dir))
    .filter((file) => file.endsWith(".epub"))
    .map((file) => join(dir, file));

  const dbBooks = await db
    .select({
      id: table.books.id,
      fileHash: table.books.fileHash,
      filePath: table.books.filePath,
      coverImagePath: table.books.coverImagePath
    })
    .from(table.books);

  const mime = await import("mime");

  const added: string[] = [];
  const removed: string[] = [];
  const renamed: string[] = [];

  const hashMap = new Map(dbBooks.map((b) => [b.fileHash, b]));
  const pathSet = new Set(diskFiles);

  async function processFile(file: string) {
    try {
      const fileHash = hashFile(file);

      const existing = hashMap.get(fileHash);

      // renamed book
      if (existing && existing.filePath !== file) {
        await db.update(table.books).set({ filePath: file }).where(eq(table.books.id, existing.id));

        renamed.push(file);
        return;
      }

      // already known book
      if (existing) {
        return;
      }

      const epub = new EPub(file);
      await epub.parse();

      const metadata = epub.metadata;

      let coverImagePath = "";

      try {
        const cover = await epub.getImage((metadata.cover as string) || "cover");

        coverImagePath = join(
          COVER_IMAGE_PATH,
          `${fileHash}.${mime.default.getExtension(cover.mimeType) || "jpg"}`
        );

        await writeFile(coverImagePath, cover.data);
      } catch (e) {
        logger.error(`Failed to extract cover for ${file}`, e);
      }

      const data: NewBook = {
        filePath: file,
        fileURL: normalizePath(file),
        fileHash,
        title: metadata.title,
        author: metadata.creator,
        description: metadata.description,
        coverImagePath: normalizePath(coverImagePath),
        language: metadata.language,
        publisher: metadata.publisher,
        publishedDate: metadata.date,
        addedAt: new Date().toISOString()
      };

      await db.insert(table.books).values(data);

      added.push(file);
    } catch (e) {
      logger.error(`Failed to sync book ${file}`, e);
    }
  }

  // process disk files
  for (const file of diskFiles) {
    await processFile(file);
  }

  // detect removed books
  for (const book of dbBooks) {
    if (!pathSet.has(book.filePath)) {
      try {
        await db.delete(table.books).where(eq(table.books.id, book.id));

        if (book.coverImagePath && existsSync(book.coverImagePath)) {
          await unlink(book.coverImagePath);
        }

        removed.push(book.filePath);
      } catch (e) {
        logger.error(`Failed to remove missing book ${book.filePath}`, e);
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
