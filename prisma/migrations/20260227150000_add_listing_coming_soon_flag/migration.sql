-- Add comingSoon toggle for listings
ALTER TABLE "Listing"
ADD COLUMN "comingSoon" BOOLEAN NOT NULL DEFAULT false;
