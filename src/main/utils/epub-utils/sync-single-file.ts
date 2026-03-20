import { eq } from "drizzle-orm";
import db, { table } from "../../database";
import { syncDirLabels } from "./sync-dir-labels";
import * as EPub from "epub";
import { extractCover } from "./extract-cover";
import { writeFile } from "node:fs/promises";
import logger from "../logger";
import type { NewBook } from "../../database/schema";
import { normalizePath } from "../normalize-path";

type SyncFileResult =
  | { type: "added"; filePath: string; bookId: string }
  | { type: "updated"; filePath: string; bookId: string }
  | { type: "renamed"; filePath: string; bookId: string }
  | { type: "error"; filePath: string };

export async function syncSingleFile({
  filePath,
  fileHash,
  labels,
  existingBookId
}: {
  filePath: string;
  fileHash: string;
  labels: string[];
  existingBookId?: string;
}): Promise<SyncFileResult> {
  const epub = new EPub.EPub(filePath);
  await epub.parse();

  const { metadata } = epub;
  const cover = await extractCover(epub, fileHash);

  if (cover) {
    try {
      await writeFile(cover.path, cover.data);
    } catch (error) {
      logger.error(`Failed to extract cover for ${filePath}`, error);
    }
  }

  const bookData: NewBook = {
    filePath,
    fileURL: normalizePath(filePath),
    fileHash,
    title: metadata.title,
    author: metadata.creator,
    description: metadata.description,
    coverImagePath: cover?.path ? normalizePath(cover.path) : null,
    language: metadata.language,
    publisher: metadata.publisher,
    publishedDate: metadata.date,
    updatedAt: new Date().toISOString()
  };

  let bookId = existingBookId;

  if (existingBookId) {
    await db.update(table.books).set(bookData).where(eq(table.books.id, existingBookId));
  } else {
    const [inserted] = await db
      .insert(table.books)
      .values({ ...bookData, addedAt: new Date().toISOString() })
      .returning();
    bookId = inserted.id;
  }

  if (bookId) {
    await syncDirLabels(bookId, labels);
  } else {
    return { type: "error", filePath };
  }

  return { type: existingBookId ? "updated" : "added", filePath, bookId };
}
