import db from "../../database";

export type GetAllLabelsResponse = Awaited<ReturnType<typeof getAllLabels>>;

export const getAllLabels = async () => {
  const books = await db.query.books.findMany({
    with: {
      readingProgress: true,
      labels: true
    }
  });

  const groups = new Map<string, { label: string; books: typeof books }>();

  for (const book of books) {
    if (!book.labels.length) continue;

    for (const label of book.labels) {
      if (!groups.has(label.id)) {
        groups.set(label.id, { label: label.name, books: [] });
      }
      groups.get(label.id)!.books.push(book);
    }
  }

  const ungrouped = books.filter((b) => !b.labels.length);

  return {
    groups: [...groups.values()],
    ungrouped
  };
};
