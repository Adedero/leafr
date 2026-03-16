ALTER TABLE `books` RENAME COLUMN `cover_path` TO `cover_image_path`;--> statement-breakpoint
ALTER TABLE `books` DROP COLUMN `page_count`;--> statement-breakpoint
ALTER TABLE `bookmarks` DROP COLUMN `page`;--> statement-breakpoint
ALTER TABLE `reading_progress` DROP COLUMN `page`;