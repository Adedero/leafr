import { eq } from "drizzle-orm";
import db, { table } from "../../database";

export interface SaveBookLocationsInput {
  bookId: string;
  locations: string;
}

export default async function saveBookLocations(input: SaveBookLocationsInput) {
  const { bookId, locations } = input;
  const existingLocations = await db.query.bookLocations.findFirst({
    where: {
      bookId
    },
    columns: { bookId: true }
  });

  if (existingLocations) {
    await db
      .update(table.bookLocations)
      .set({ locations })
      .where(eq(table.bookLocations.bookId, bookId));
  } else {
    await db.insert(table.bookLocations).values({ bookId, locations });
  }

  return true;
}
