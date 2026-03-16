import { mkdir, readdir, writeFile } from "node:fs/promises";
import db, { table } from "../database";
import getLibPath from "../utils/get-lib-path";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { NewBook } from "../database/schema";
import { hashFile } from "../utils/hash-file";
import { COVER_IMAGE_PATH } from "../utils/constants";
import { normalizePath } from "../utils/normalize-path";
import { EPub } from "epub";
import logger from "../utils/logger";

export async function initializeBooks() {
  const books = await db.select({ id: table.books.id }).from(table.books).limit(1);

  const isEmpty = books.length === 0;
  if (!isEmpty) {
    return;
  }

  const dir = await getLibPath();

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  const diskFiles = (await readdir(dir))
    .filter((file) => file.endsWith(".epub"))
    .map((file) => join(dir, file));

  const mime = await import("mime");

  async function processFile(file: string) {
    const epub = new EPub(file);
    await epub.parse();
    try {
      const metadata = epub.metadata;
      const fileHash = hashFile(file);

      let coverImagePath = "";

      try {
        const cover = await epub.getImage((metadata.cover as string) || "cover");
        coverImagePath = join(
          COVER_IMAGE_PATH,
          `${fileHash}.${mime.default.getExtension(cover.mimeType) || "jpg"}`
        );
        await writeFile(coverImagePath, cover.data);
      } catch (e) {
        logger.error(`Failed to extract book cover for ${file}`, e);
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
    } catch (e) {
      logger.error(`Failed to process book ${file}`, e);
    }
  }

  for (const file of diskFiles) {
    await processFile(file);
  }
}
