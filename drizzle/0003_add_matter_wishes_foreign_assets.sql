ALTER TABLE `matter_wishes`
  ADD COLUMN `foreign_assets_treatment` varchar(32) DEFAULT 'not_recorded' AFTER `general_notes`;

ALTER TABLE `matter_wishes`
  ADD COLUMN `foreign_assets_details` text AFTER `foreign_assets_treatment`;

ALTER TABLE `matter_wishes`
  ADD COLUMN `foreign_will_details` text AFTER `foreign_assets_details`;
