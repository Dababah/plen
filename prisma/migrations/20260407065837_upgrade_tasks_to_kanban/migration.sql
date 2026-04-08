-- AlterTable
ALTER TABLE `tasks` ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `archived_reason` ENUM('completed_expired', 'cancelled_expired', 'manual') NULL,
    ADD COLUMN `cancelled_at` DATETIME(3) NULL,
    ADD COLUMN `completed_at` DATETIME(3) NULL,
    ADD COLUMN `is_archived` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0,
    MODIFY `title` VARCHAR(500) NOT NULL,
    MODIFY `category` VARCHAR(191) NULL DEFAULT 'Lainnya';

-- CreateTable
CREATE TABLE `subtasks` (
    `id` VARCHAR(191) NOT NULL,
    `task_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(500) NOT NULL,
    `is_done` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `subtasks_task_id_fkey`(`task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subtasks` ADD CONSTRAINT `subtasks_task_id_fkey` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
