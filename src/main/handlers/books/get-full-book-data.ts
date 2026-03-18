import db from "../../database";
import type { FullBook } from "../../database/schema";

export default async function getFullBookData(bookId: string): Promise<FullBook | undefined> {
  const book = await db.query.books.findFirst({
    where: { id: bookId },
    with: {
      bookmarks: true,
      highlights: true,
      labels: true,
      readingProgress: true,
      // readingSessions: true,
      favoriteRecord: true,
      locations: true
    }
  });
  return book;
}
