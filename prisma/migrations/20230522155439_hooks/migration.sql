-- CreateTable
CREATE TABLE `Hooks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `apiKeyId` INTEGER NOT NULL,
    `hook_id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `headers` JSON NOT NULL,
    `body` JSON NOT NULL,

    UNIQUE INDEX `Hooks_hook_id_key`(`hook_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParticipantId` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hookId` INTEGER NOT NULL,
    `participant_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ParticipantId_participant_id_key`(`participant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Hooks` ADD CONSTRAINT `Hooks_apiKeyId_fkey` FOREIGN KEY (`apiKeyId`) REFERENCES `ApiKey`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParticipantId` ADD CONSTRAINT `ParticipantId_hookId_fkey` FOREIGN KEY (`hookId`) REFERENCES `Hooks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
