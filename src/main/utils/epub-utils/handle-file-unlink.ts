import db from "../../database";
import { hashFile } from "../hash-file";
import { removeBook } from "./remove-book";

export default async function handleFileUnlink(filePath: string) {
  if (!filePath || !filePath.endsWith(".epub")) {
    return;
  }
  const fileHash = hashFile(filePath);
  const book = await db.query.books.findFirst({
    where: { fileHash },
    columns: { id: true, filePath: true, coverImagePath: true }
  });

  if (book) {
    await removeBook(book);
  }
}
