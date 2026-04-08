-- AlterTable
ALTER TABLE `courses` ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `priority` VARCHAR(191) NOT NULL DEFAULT 'medium';
