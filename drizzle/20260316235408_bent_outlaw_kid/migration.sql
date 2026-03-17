CREATE TABLE `book_locations` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL UNIQUE,
	`locations` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_book_locations_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
);
