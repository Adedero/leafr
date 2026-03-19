import db, { table } from "../../database";
import { syncDirLabels } from "./sync-dir-labels";
import * as EPub from "epub";
import { extractCover } from "./extract-cover";
import { writeFile } from "node:fs/promises";
import logger from "../logger";
import type { NewBook } from "../../database/schema";
import { normalizePath } from "../normalize-path";

type SyncFileResult =
  | { type: "added"; filePath: string }
  | { type: "renamed"; filePath: string }
  | { type: "error"; filePath: string };

export async function syncSingleFile({
  filePath,
  fileHash,
  labels
}: {
  filePath: string;
  fileHash: string;
  labels: string[];
}): Promise<SyncFileResult> {
  const epub = new EPub.EPub(filePath);
  await epub.parse();

  const { metadata } = epub;
  const cover = await extractCover(epub, fileHash);

  try {
    if (!cover) throw new Error("No cover found");
    await writeFile(cover.path, cover.data);
  } catch (error) {
    logger.error(`Failed to extract cover for ${filePath}`, error);
  }

  const newBook: NewBook = {
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
    addedAt: new Date().toISOString()
  };

  const [inserted] = await db.insert(table.books).values(newBook).returning();

  await syncDirLabels(inserted.id, labels);

  return { type: "added", filePath };
}
