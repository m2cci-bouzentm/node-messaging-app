/*
  Warnings:

  - You are about to drop the column `userOneId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userTwoId` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "userOneId",
DROP COLUMN "userTwoId";
