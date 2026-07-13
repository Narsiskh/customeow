CREATE TABLE `escalations` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`reason` text,
	`assigned_agent_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `escalations_chat_id_idx` ON `escalations` (`chat_id`);--> statement-breakpoint
CREATE INDEX `escalations_status_idx` ON `escalations` (`status`);