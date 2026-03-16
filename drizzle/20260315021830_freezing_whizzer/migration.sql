PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reading_sessions` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text,
	`duration_seconds` integer,
	`words_read` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_reading_sessions_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_reading_sessions`(`id`, `book_id`, `started_at`, `ended_at`, `duration_seconds`, `words_read`, `created_at`, `updated_at`) SELECT `id`, `book_id`, `started_at`, `ended_at`, `duration_seconds`, `words_read`, `created_at`, `updated_at` FROM `reading_sessions`;--> statement-breakpoint
DROP TABLE `reading_sessions`;--> statement-breakpoint
ALTER TABLE `__new_reading_sessions` RENAME TO `reading_sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;