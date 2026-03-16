ALTER TABLE `books` ADD `file_url` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_books` (
	`id` text PRIMARY KEY,
	`file_path` text NOT NULL UNIQUE,
	`file_url` text UNIQUE,
	`file_hash` text NOT NULL UNIQUE,
	`title` text NOT NULL,
	`author` text,
	`description` text,
	`cover_image_path` text,
	`language` text,
	`publisher` text,
	`published_date` text,
	`added_at` text NOT NULL,
	`last_opened_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_books`(`id`, `file_path`, `file_hash`, `title`, `author`, `description`, `cover_image_path`, `language`, `publisher`, `published_date`, `added_at`, `last_opened_at`, `created_at`, `updated_at`) SELECT `id`, `file_path`, `file_hash`, `title`, `author`, `description`, `cover_image_path`, `language`, `publisher`, `published_date`, `added_at`, `last_opened_at`, `created_at`, `updated_at` FROM `books`;--> statement-breakpoint
DROP TABLE `books`;--> statement-breakpoint
ALTER TABLE `__new_books` RENAME TO `books`;--> statement-breakpoint
PRAGMA foreign_keys=ON;