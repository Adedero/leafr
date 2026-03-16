PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_bookmarks` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL,
	`chapter` text NOT NULL,
	`cfi` text NOT NULL,
	`excerpt` text,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_bookmarks_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_bookmarks`(`id`, `book_id`, `chapter`, `cfi`, `excerpt`, `note`, `created_at`, `updated_at`) SELECT `id`, `book_id`, `chapter`, `cfi`, `excerpt`, `note`, `created_at`, `updated_at` FROM `bookmarks`;--> statement-breakpoint
DROP TABLE `bookmarks`;--> statement-breakpoint
ALTER TABLE `__new_bookmarks` RENAME TO `bookmarks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_book_to_labels` (
	`book_id` text NOT NULL,
	`label_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `book_to_labels_pk` PRIMARY KEY(`book_id`, `label_id`),
	CONSTRAINT `fk_book_to_labels_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_book_to_labels_label_id_labels_id_fk` FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_book_to_labels`(`book_id`, `label_id`, `created_at`, `updated_at`) SELECT `book_id`, `label_id`, `created_at`, `updated_at` FROM `book_to_labels`;--> statement-breakpoint
DROP TABLE `book_to_labels`;--> statement-breakpoint
ALTER TABLE `__new_book_to_labels` RENAME TO `book_to_labels`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_favorites` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL UNIQUE,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_favorites_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_favorites`(`id`, `book_id`, `created_at`, `updated_at`) SELECT `id`, `book_id`, `created_at`, `updated_at` FROM `favorites`;--> statement-breakpoint
DROP TABLE `favorites`;--> statement-breakpoint
ALTER TABLE `__new_favorites` RENAME TO `favorites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_highlights` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL,
	`cfi_start` text NOT NULL,
	`cfi_end` text,
	`text` text,
	`color` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_highlights_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_highlights`(`id`, `book_id`, `cfi_start`, `cfi_end`, `text`, `color`, `created_at`, `updated_at`) SELECT `id`, `book_id`, `cfi_start`, `cfi_end`, `text`, `color`, `created_at`, `updated_at` FROM `highlights`;--> statement-breakpoint
DROP TABLE `highlights`;--> statement-breakpoint
ALTER TABLE `__new_highlights` RENAME TO `highlights`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_reading_progress` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL UNIQUE,
	`chapter` text NOT NULL,
	`cfi` text NOT NULL,
	`percentage` real NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_reading_progress_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_reading_progress`(`id`, `book_id`, `chapter`, `cfi`, `percentage`, `created_at`, `updated_at`) SELECT `id`, `book_id`, `chapter`, `cfi`, `percentage`, `created_at`, `updated_at` FROM `reading_progress`;--> statement-breakpoint
DROP TABLE `reading_progress`;--> statement-breakpoint
ALTER TABLE `__new_reading_progress` RENAME TO `reading_progress`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
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
	CONSTRAINT `fk_reading_sessions_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_reading_sessions`(`id`, `book_id`, `started_at`, `ended_at`, `duration_seconds`, `words_read`, `created_at`, `updated_at`) SELECT `id`, `book_id`, `started_at`, `ended_at`, `duration_seconds`, `words_read`, `created_at`, `updated_at` FROM `reading_sessions`;--> statement-breakpoint
DROP TABLE `reading_sessions`;--> statement-breakpoint
ALTER TABLE `__new_reading_sessions` RENAME TO `reading_sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;