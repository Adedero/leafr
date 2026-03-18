import db, { table } from "../database";
import syncBooks from "../handlers/books/sync-books";

/**
 * Initializes the books table by scanning the library directory and inserting any new books.
 */
export async function initializeBooks() {
  const books = await db.select({ id: table.books.id }).from(table.books).limit(1);

  const isEmpty = books.length === 0;
  if (!isEmpty) {
    return null;
  }

  return await syncBooks();
}
