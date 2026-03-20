import db from "../../database";
import { hashFile } from "../hash-file";
import { syncDirLabels } from "./sync-dir-labels";
import { extractLabels } from "./extract-labels";
import { syncSingleFile } from "./sync-single-file";
import logger from "../logger";

interface HandleFileAddInput {
  filePath: string;
  rootDir: string;
}
export default async function handleFileAdd({
  filePath,
  rootDir
}: HandleFileAddInput) {
  if (!filePath || !filePath.endsWith(".epub")) {
    return;
  }
  const fileHash = hashFile(filePath);
  const dirLabels = extractLabels(rootDir, filePath);

  const bookByPath = await db.query.books.findFirst({
    where: { filePath },
    columns: { id: true, fileHash: true }
  });

  if (bookByPath) {
    if (bookByPath.fileHash !== fileHash) {
      // File content changed. Re-extract metadata and cover.
      try {
        await syncSingleFile({
          filePath,
          fileHash,
          labels: dirLabels,
          existingBookId: bookByPath.id
        });
      } catch (error) {
        logger.error(`Error re-syncing modified file ${filePath}:`, error);
      }
    } else {
      // Just re-sync labels in case directories changed.
      await syncDirLabels(bookByPath.id, dirLabels);
    }
    return;
  }

  const existingByHash = await db.query.books.findFirst({
    where: { fileHash },
    columns: { id: true, filePath: true }
  });

  if (existingByHash && existingByHash.filePath !== filePath) {
    // File was moved or renamed. Update path and re-extract metadata/cover.
    try {
      await syncSingleFile({
        filePath,
        fileHash,
        labels: dirLabels,
        existingBookId: existingByHash.id
      });
    } catch (error) {
      logger.error(`Error re-syncing moved file ${filePath}:`, error);
    }
    return;
  }

  try {
    await syncSingleFile({ filePath, fileHash, labels: dirLabels });
  } catch (error) {
    logger.error("Error syncing single file:", error);
  }
}
