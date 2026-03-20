import db, { table } from "../database";
import syncBooks from "../handlers/books/sync-books";
import logger from "../utils/logger";

/**
 * Initializes the books table by scanning the library directory and inserting any new books.
 */
export async function initializeBooks() {
  const books = await db
    .select({ id: table.books.id })
    .from(table.books)
    .limit(1);

  const isEmpty = books.length === 0;
  if (!isEmpty) {
    return null;
  }

  try {
    return await syncBooks();
  } catch (error) {
    logger.error("Failed to initialize books on start up", error);
    return null;
  }
}
