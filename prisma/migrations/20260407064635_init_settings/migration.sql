-- CreateTable
CREATE TABLE `finance_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_budgets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `budget` DOUBLE NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT 'Wallet',
    `color` VARCHAR(191) NOT NULL DEFAULT '#18181b',
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_saving_goals` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `target_amount` DOUBLE NOT NULL,
    `current_amount` DOUBLE NOT NULL DEFAULT 0,
    `icon` VARCHAR(191) NOT NULL DEFAULT 'Target',
    `color` VARCHAR(191) NOT NULL DEFAULT '#18181b',
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_saving_deposits` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `saving_goal_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_debts` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `total_debt` DOUBLE NOT NULL,
    `paid_amount` DOUBLE NOT NULL DEFAULT 0,
    `monthly_payment` DOUBLE NOT NULL,
    `due_day_of_month` INTEGER NOT NULL,
    `start_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'aktif',
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_debt_payments` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `debt_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_investments` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `initial_amount` DOUBLE NOT NULL,
    `current_value` DOUBLE NOT NULL,
    `lots` DOUBLE NULL,
    `buy_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `ai_provider` VARCHAR(191) NULL,
    `ai_model` VARCHAR(191) NULL,
    `ai_api_key_encrypted` TEXT NULL,
    `telegram_bot_token_encrypted` TEXT NULL,
    `telegram_chat_id` VARCHAR(191) NULL,
    `notif_morning_summary` BOOLEAN NOT NULL DEFAULT false,
    `notif_stock_drop_pct` DOUBLE NOT NULL DEFAULT 5.00,
    `notif_stock_rise_pct` DOUBLE NOT NULL DEFAULT 10.00,
    `notif_debt_reminder_days` INTEGER NOT NULL DEFAULT 3,
    `notif_budget_threshold_pct` INTEGER NOT NULL DEFAULT 80,
    `notif_saving_reminder` BOOLEAN NOT NULL DEFAULT false,
    `notif_telegram_ai_chat` BOOLEAN NOT NULL DEFAULT false,
    `custom_ai_endpoint` TEXT NULL,
    `custom_ai_header_name` VARCHAR(191) NULL,
    `custom_ai_header_prefix` VARCHAR(191) NULL,
    `custom_ai_body_template` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_settings_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `finance_transactions` ADD CONSTRAINT `finance_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_budgets` ADD CONSTRAINT `finance_budgets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_saving_goals` ADD CONSTRAINT `finance_saving_goals_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_saving_deposits` ADD CONSTRAINT `finance_saving_deposits_saving_goal_id_fkey` FOREIGN KEY (`saving_goal_id`) REFERENCES `finance_saving_goals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_debts` ADD CONSTRAINT `finance_debts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_debt_payments` ADD CONSTRAINT `finance_debt_payments_debt_id_fkey` FOREIGN KEY (`debt_id`) REFERENCES `finance_debts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finance_investments` ADD CONSTRAINT `finance_investments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
