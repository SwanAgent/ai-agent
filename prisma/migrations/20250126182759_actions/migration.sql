/*
  Warnings:

  - You are about to drop the column `conversationId` on the `actions` table. All the data in the column will be lost.
  - Added the required column `chatId` to the `actions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "actions" DROP CONSTRAINT "actions_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "actions" DROP CONSTRAINT "actions_userId_fkey";

-- AlterTable
ALTER TABLE "actions" DROP COLUMN "conversationId",
ADD COLUMN     "chatId" TEXT NOT NULL,
ADD COLUMN     "lastFailureAt" TIMESTAMP(3),
ADD COLUMN     "lastSuccessAt" TIMESTAMP(3),
ADD COLUMN     "name" VARCHAR(255),
ADD COLUMN     "startTime" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
