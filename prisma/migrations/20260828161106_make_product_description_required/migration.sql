/*
  Warnings:

  - Made the column `desc` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "desc" SET NOT NULL,
ALTER COLUMN "lowStockThreshold" SET DEFAULT 10;
