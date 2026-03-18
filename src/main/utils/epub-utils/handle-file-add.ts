import { eq } from "drizzle-orm";
import db, { table } from "../../database";
import { hashFile } from "../hash-file";
import { syncDirLabels } from "./sync-dir-labels";
import { extractLabels } from "./extract-labels";
import { syncSingleFile } from "./sync-single-file";
import logger from "../logger";

interface HandleFileAddInput {
  filePath: string;
  rootDir: string;
}
export default async function handleFileAdd({ filePath, rootDir }: HandleFileAddInput) {
  if (!filePath || !filePath.endsWith(".epub")) {
    return;
  }
  const fileHash = hashFile(filePath);
  const dirLabels = extractLabels(filePath, rootDir);

  const existing = await db.query.books.findFirst({
    where: { fileHash },
    columns: { id: true, fileHash: true, filePath: true }
  });

  if (existing && existing.filePath !== filePath) {
    await db.update(table.books).set({ filePath }).where(eq(table.books.id, existing.id));
    await syncDirLabels(existing.id, dirLabels);
    return;
  }

  try {
    await syncSingleFile({ filePath, fileHash, labels: dirLabels });
  } catch (error) {
    logger.error("Error syncing single file:", error);
  }
}
