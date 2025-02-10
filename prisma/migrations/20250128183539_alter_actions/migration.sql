/*
  Warnings:

  - Made the column `frequency` on table `actions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `maxExecutions` on table `actions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `actions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `startTime` on table `actions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "actions" ALTER COLUMN "frequency" SET NOT NULL,
ALTER COLUMN "maxExecutions" SET NOT NULL,
ALTER COLUMN "maxExecutions" SET DEFAULT 0,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "startTime" SET NOT NULL;
