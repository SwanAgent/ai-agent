/*
  Warnings:

  - You are about to drop the column `earlyAccess` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "earlyAccess",
ADD COLUMN     "accountCreated" BOOLEAN NOT NULL DEFAULT false;
