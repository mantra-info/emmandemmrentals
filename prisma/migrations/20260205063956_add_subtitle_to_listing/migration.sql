/*
  Warnings:

  - The `highlights` column on the `Listing` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "subtitle" TEXT,
DROP COLUMN "highlights",
ADD COLUMN     "highlights" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- CreateTable
CREATE TABLE "ListingSpecification" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAdvantage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingAdvantage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingBedroom" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingBedroom_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ListingSpecification" ADD CONSTRAINT "ListingSpecification_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAdvantage" ADD CONSTRAINT "ListingAdvantage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingBedroom" ADD CONSTRAINT "ListingBedroom_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
