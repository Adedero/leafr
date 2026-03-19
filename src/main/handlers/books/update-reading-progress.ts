import { eq } from "drizzle-orm";
import db, { table } from "../../database";

export interface UpdateReadingProgressInput {
  bookId: string;
  cfi: string;
  percentage: number;
}

export default async function updateReadingProgress(
  input: UpdateReadingProgressInput
) {
  const { bookId, cfi, percentage } = input;
  try {
    const [existingReadingProgress] = await db
      .update(table.readingProgress)
      .set({
        cfi,
        percentage
      })
      .where(eq(table.readingProgress.bookId, bookId))
      .returning();

    if (!existingReadingProgress) {
      await db.insert(table.readingProgress).values({
        bookId,
        cfi,
        percentage
      });
    }
    return true;
  } catch {
    return false;
  }
}
