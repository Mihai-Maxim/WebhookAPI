/*
  Warnings:

  - Added the required column `body` to the `ParticipantId` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ParticipantId` ADD COLUMN `body` JSON NOT NULL;
