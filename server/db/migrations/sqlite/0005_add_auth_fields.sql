-- Add new auth-related columns
ALTER TABLE `users` ADD COLUMN `password_hash` text;
ALTER TABLE `users` ADD COLUMN `role` text NOT NULL DEFAULT 'customer';

-- SQLite can't ALTER a column to be nullable in place if it was NOT NULL,
-- so avatar needs a rebuild if it was originally NOT NULL.
-- Skip this block if avatar was already nullable.
CREATE TABLE `__new_users` (
                             `id` text PRIMARY KEY NOT NULL,
                             `email` text NOT NULL,
                             `name` text NOT NULL,
                             `avatar` text,
                             `username` text NOT NULL,
                             `password_hash` text,
                             `role` text NOT NULL DEFAULT 'customer',
                             `provider` text NOT NULL,
                             `provider_id` text NOT NULL,
                             `created_at` integer NOT NULL
);

INSERT INTO `__new_users` (`id`, `email`, `name`, `avatar`, `username`, `password_hash`, `role`, `provider`, `provider_id`, `created_at`)
SELECT `id`, `email`, `name`, `avatar`, `username`, `password_hash`, `role`, `provider`, `provider_id`, `created_at` FROM `users`;

DROP TABLE `users`;
ALTER TABLE `__new_users` RENAME TO `users`;

CREATE UNIQUE INDEX `users_provider_id_idx` ON `users` (`provider`, `provider_id`);
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);
