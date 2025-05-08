-- CreateTable
CREATE TABLE `Stop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stop_name` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,

    UNIQUE INDEX `Stop_stop_name_key`(`stop_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Route` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `route_code` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Route_route_code_key`(`route_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RouteStop` (
    `route_id` INTEGER NOT NULL,
    `stop_id` INTEGER NOT NULL,

    INDEX `RouteStop_stop_id_fkey`(`stop_id`),
    PRIMARY KEY (`route_id`, `stop_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RouteStop` ADD CONSTRAINT `RouteStop_route_id_fkey` FOREIGN KEY (`route_id`) REFERENCES `Route`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RouteStop` ADD CONSTRAINT `RouteStop_stop_id_fkey` FOREIGN KEY (`stop_id`) REFERENCES `Stop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
