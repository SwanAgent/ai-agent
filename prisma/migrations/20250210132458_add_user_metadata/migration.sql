-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'stake';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "metadata" JSONB;
