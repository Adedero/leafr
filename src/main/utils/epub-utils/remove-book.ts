import { eq } from "drizzle-orm";
import db, { table } from "../../database";
import { unlink } from "node:fs/promises";
import { existsSync } from "node:fs";

export async function removeBook(book: {
  id: string;
  filePath: string;
  coverImagePath: string | null;
}): Promise<void> {
  await db.delete(table.books).where(eq(table.books.id, book.id));
  if (book.coverImagePath && existsSync(book.coverImagePath)) {
    await unlink(book.coverImagePath);
  }
}
