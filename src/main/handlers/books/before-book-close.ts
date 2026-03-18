import { and, desc, eq, isNull } from "drizzle-orm";
import db, { table } from "../../database";

export interface BeforeBookCloseInput {
  bookId: string;
  cfi: string;
  percentage: number;
}

export default async function beforeBookClose(input: BeforeBookCloseInput) {
  const { bookId, cfi, percentage } = input;
  try {
    // Get the current unfinished reading session for this book
    const [currentSession] = await db
      .select()
      .from(table.readingSessions)
      .where(and(eq(table.readingSessions.bookId, bookId), isNull(table.readingSessions.endedAt)))
      .orderBy(desc(table.readingSessions.startedAt))
      .limit(1);

    if (!currentSession) {
      return false;
    }

    const endedAt = new Date().toISOString();
    const durationSeconds = Math.floor(
      (new Date(endedAt).getTime() - new Date(currentSession.startedAt).getTime()) / 1000
    );

    // Update the reading session and reading progress
    await db.transaction(async (tx) => {
      await tx
        .update(table.readingSessions)
        .set({
          endedAt,
          durationSeconds
        })
        .where(eq(table.readingSessions.id, currentSession.id));

      const [existingReadingProgress] = await tx
        .update(table.readingProgress)
        .set({
          cfi,
          percentage
        })
        .where(eq(table.readingProgress.bookId, bookId))
        .returning();

      if (!existingReadingProgress) {
        await tx.insert(table.readingProgress).values({
          bookId,
          cfi,
          percentage
        });
      }
    });
    return true;
  } catch {
    return false;
  }
}
