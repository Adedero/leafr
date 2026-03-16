import db from "../../database";

export type GetAllBooksReturn = Awaited<ReturnType<typeof getAllBooks>>;

export default async function getAllBooks() {
  const books = await db.query.books.findMany({
    with: {
      readingProgress: true
    }
  });
  // const books =  await db.select().from(table.books).all();
  return books;
}
