import db, { table } from "../../database";
import { and, eq, inArray } from "drizzle-orm";

// Sync directory labels for a book
export async function syncDirLabels(
  bookId: string,
  labels: string[]
): Promise<void> {
  const normalize = (s: string) => s.trim().toLowerCase();

  const book = await db.query.books.findFirst({
    where: { id: bookId },
    with: { labels: { where: { fromDirectory: true } } },
    columns: { id: true }
  });

  if (!book) throw new Error("Book not found");

  const existingDirLabels = book.labels;

  const existingSet = new Set(existingDirLabels.map((l) => normalize(l.name)));

  const newSet = new Set(labels.map(normalize));

  const toRemove = existingDirLabels.filter(
    (l) => !newSet.has(normalize(l.name))
  );

  const toAdd = [...newSet].filter((name) => !existingSet.has(name));

  if (toAdd.length === 0 && toRemove.length === 0) return;

  await db.transaction(async (tx) => {
    if (toRemove.length > 0) {
      await tx.delete(table.booksToLabels).where(
        and(
          eq(table.booksToLabels.bookId, bookId),
          inArray(
            table.booksToLabels.labelId,
            toRemove.map((l) => l.id)
          )
        )
      );
    }

    if (toAdd.length > 0) {
      await tx
        .insert(table.labels)
        .values(toAdd.map((name) => ({ name, fromDirectory: true })))
        .onConflictDoNothing();

      const addedLabels = await tx
        .select({ id: table.labels.id, name: table.labels.name })
        .from(table.labels)
        .where(
          and(
            inArray(table.labels.name, toAdd),
            eq(table.labels.fromDirectory, true)
          )
        );

      await tx
        .insert(table.booksToLabels)
        .values(
          addedLabels.map(({ id }) => ({
            bookId,
            labelId: id,
            fromDirectory: true
          }))
        )
        .onConflictDoNothing();
    }
  });
}
