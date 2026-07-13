ALTER TABLE `chats` ADD `status` text DEFAULT 'open' NOT NULL;--> statement-breakpoint
CREATE INDEX `chats_status_idx` ON `chats` (`status`);