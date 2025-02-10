-- DropForeignKey
ALTER TABLE "actions" DROP CONSTRAINT "actions_chatId_fkey";

-- DropForeignKey
ALTER TABLE "actions" DROP CONSTRAINT "actions_userId_fkey";

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
