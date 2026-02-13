/*
  Warnings:

  - The `amenities` column on the `Listing` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "mapIframe" TEXT,
DROP COLUMN "amenities",
ADD COLUMN     "amenities" JSONB[] DEFAULT ARRAY[]::JSONB[];
