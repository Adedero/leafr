import { eq, desc } from "drizzle-orm";
import db, { table } from "../../database";
import logger from "../../utils/logger";

export default async function beforeBookOpen(bookId: string) {
  const now = new Date().toISOString();

  try {
    // Update lastOpenedAt
    await db.update(table.books).set({ lastOpenedAt: now }).where(eq(table.books.id, bookId));

    // Check if the latest session is still open
    const [latestSession] = await db
      .select()
      .from(table.readingSessions)
      .where(eq(table.readingSessions.bookId, bookId))
      .orderBy(desc(table.readingSessions.startedAt))
      .limit(1);

    // Only create a new session if none exists or the last one is closed
    if (!latestSession || latestSession.endedAt) {
      await db.insert(table.readingSessions).values({
        bookId,
        startedAt: now,
        endedAt: null,
        durationSeconds: 0
      });
    }

    return true;
  } catch (e) {
    logger.error(`Error opening book with ID ${bookId}`, e);
    return false;
  }
}
