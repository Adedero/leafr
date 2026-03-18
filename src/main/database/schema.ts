import { int, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { defineRelations } from "drizzle-orm";
import { ulid } from "ulid";

const id = text("id")
  .primaryKey()
  .notNull()
  .$defaultFn(() => ulid());

const createdAt = text("created_at")
  .notNull()
  .$default(() => new Date().toISOString());

const updatedAt = text("updated_at")
  .notNull()
  .$default(() => new Date().toISOString())
  .$onUpdate(() => new Date().toISOString());

// ─── Books ─────────────────────────────────────────────────────────────────
export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type FullBook = Book & {
  bookmarks: Bookmark[];
  highlights: Highlight[];
  labels: Label[];
  readingProgress: ReadingProgress | null;
  favoriteRecord: Favorite | null;
  locations: BookLocation | null;
};

export const books = sqliteTable("books", {
  id,
  filePath: text("file_path").notNull().unique(),
  fileURL: text("file_url").notNull().unique(),
  fileHash: text("file_hash").notNull().unique(),
  title: text("title").notNull(),
  author: text("author"),
  description: text("description"),
  coverImagePath: text("cover_image_path"),
  language: text("language"),
  publisher: text("publisher"),
  publishedDate: text("published_date"),
  addedAt: text("added_at")
    .notNull()
    .$default(() => new Date().toISOString()),
  lastOpenedAt: text("last_opened_at"),
  createdAt,
  updatedAt
});

// ─── Book Locations ─────────────────────────────────────────────────────────
export type BookLocation = typeof bookLocations.$inferSelect;
export type NewBookLocation = typeof bookLocations.$inferInsert;
export const bookLocations = sqliteTable("book_locations", {
  id,
  bookId: text("book_id")
    .notNull()
    .unique()
    .references(() => books.id, { onDelete: "cascade" }),
  locations: text("locations").notNull(),
  createdAt,
  updatedAt
});

// ─── Reading Progress ─────────────────────────────────────────────────────────
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type NewReadingProgress = typeof readingProgress.$inferInsert;
export const readingProgress = sqliteTable("reading_progress", {
  id,
  bookId: text("book_id")
    .notNull()
    .unique()
    .references(() => books.id, { onDelete: "cascade" }),
  cfi: text("cfi").notNull(),
  percentage: real("percentage").notNull(),
  createdAt,
  updatedAt
});

// ─── Bookmarks ─────────────────────────────────────────────────────────
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
export const bookmarks = sqliteTable("bookmarks", {
  id,
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  chapter: text("chapter").notNull(),
  cfi: text("cfi").notNull(),
  excerpt: text("excerpt"),
  note: text("note"),
  createdAt,
  updatedAt
});

// ─── Favorites ─────────────────────────────────────────────────────────
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export const favorites = sqliteTable("favorites", {
  id,
  bookId: text("book_id")
    .notNull()
    .unique()
    .references(() => books.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt
});

// ─── Labels ─────────────────────────────────────────────────────────
export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;
export const labels = sqliteTable("labels", {
  id,
  name: text("name").notNull().unique(),
  fromDirectory: integer("from_directory", { mode: "boolean" }).notNull(),
  createdAt,
  updatedAt
});

// ─── Books to Labels ─────────────────────────────────────────────────────────
export type BooksToLabels = typeof booksToLabels.$inferSelect;
export type NewBooksToLabels = typeof booksToLabels.$inferInsert;
export const booksToLabels = sqliteTable(
  "book_to_labels",
  {
    // id,
    bookId: text("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt
  },
  (t) => [primaryKey({ columns: [t.bookId, t.labelId] })]
);

// ─── Reading Sessions ─────────────────────────────────────────────────────────
export type ReadingSession = typeof readingSessions.$inferSelect;
export type NewReadingSession = typeof readingSessions.$inferInsert;
export const readingSessions = sqliteTable("reading_sessions", {
  id,
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  startedAt: text("started_at").notNull(),
  endedAt: text("ended_at"),
  durationSeconds: int("duration_seconds"),
  createdAt,
  updatedAt
});

// ─── Highlights ─────────────────────────────────────────────────────────
export type Highlight = typeof highlights.$inferSelect;
export type NewHighlight = typeof highlights.$inferInsert;
export const highlights = sqliteTable("highlights", {
  id,
  bookId: text("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  cfiStart: text("cfi_start").notNull(),
  cfiEnd: text("cfi_end"),
  text: text("text"),
  color: text("color"),
  createdAt,
  updatedAt
});

// ─── Settings ─────────────────────────────────────────────────────────
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export const settings = sqliteTable("settings", {
  id,
  libraryPath: text("library_path"),
  createdAt,
  updatedAt
});

// ─── Relations ─────────────────────────────────────────────────────────────────
export const relations = defineRelations(
  {
    books,
    bookLocations,
    readingProgress,
    bookmarks,
    favorites,
    labels,
    booksToLabels,
    readingSessions,
    highlights
  },
  (r) => ({
    books: {
      readingProgress: r.one.readingProgress({
        from: r.books.id,
        to: r.readingProgress.bookId
      }),
      bookmarks: r.many.bookmarks(),
      labels: r.many.labels(),
      readingSessions: r.many.readingSessions(),
      highlights: r.many.highlights(),
      favoriteRecord: r.one.favorites({
        from: r.books.id,
        to: r.favorites.bookId
      }),
      locations: r.one.bookLocations({
        from: r.books.id,
        to: r.bookLocations.bookId
      })
    },

    bookmarks: {
      book: r.one.books({
        from: r.bookmarks.bookId,
        to: r.books.id
      })
    },

    favorites: {
      book: r.one.books({
        from: r.favorites.bookId,
        to: r.books.id
      })
    },

    labels: {
      books: r.many.books({
        from: r.labels.id.through(r.booksToLabels.labelId),
        to: r.books.id.through(r.booksToLabels.bookId)
      })
    },

    highlights: {
      book: r.one.books({
        from: r.highlights.bookId,
        to: r.books.id
      })
    },

    readingSessions: {
      book: r.one.books({
        from: r.readingSessions.bookId,
        to: r.books.id
      })
    }
  })
);
