import db from "../../database";
import { removeBook } from "./remove-book";

export default async function handleFileUnlink(filePath: string) {
  if (!filePath || !filePath.endsWith(".epub")) {
    return;
  }
  const book = await db.query.books.findFirst({
    where: { filePath },
    columns: { id: true, filePath: true, coverImagePath: true }
  });

  if (book) {
    await removeBook(book);
  }
}
