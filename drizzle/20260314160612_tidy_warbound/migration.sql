CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL,
	`page` integer NOT NULL,
	`chapter` text NOT NULL,
	`cfi` text NOT NULL,
	`excerpt` text,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_bookmarks_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` text PRIMARY KEY,
	`file_path` text NOT NULL UNIQUE,
	`title` text NOT NULL,
	`author` text,
	`description` text,
	`cover_path` text,
	`language` text,
	`publisher` text,
	`published_date` text,
	`page_count` integer,
	`added_at` text NOT NULL,
	`last_opened_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `book_to_labels` (
	`book_id` text NOT NULL,
	`label_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `book_to_labels_pk` PRIMARY KEY(`book_id`, `label_id`),
	CONSTRAINT `fk_book_to_labels_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`),
	CONSTRAINT `fk_book_to_labels_label_id_labels_id_fk` FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL UNIQUE,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_favorites_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE TABLE `highlights` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL,
	`cfi_start` text NOT NULL,
	`cfi_end` text,
	`text` text,
	`color` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_highlights_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE TABLE `labels` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reading_progress` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL UNIQUE,
	`page` integer NOT NULL,
	`chapter` text NOT NULL,
	`cfi` text NOT NULL,
	`percentage` real NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_reading_progress_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_sessions` (
	`id` text PRIMARY KEY,
	`book_id` text NOT NULL UNIQUE,
	`started_at` text NOT NULL,
	`ended_at` text,
	`duration_seconds` integer,
	`words_read` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT `fk_reading_sessions_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY,
	`library_path` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
