ALTER TABLE `matters` ADD COLUMN `jurisdiction` enum('england_wales','scotland') NOT NULL DEFAULT 'england_wales' AFTER `matter_type`;
