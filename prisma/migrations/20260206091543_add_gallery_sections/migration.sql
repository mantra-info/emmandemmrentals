-- CreateTable
CREATE TABLE "ListingGallerySection" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingGallerySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingGalleryImage" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingGalleryImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ListingGallerySection" ADD CONSTRAINT "ListingGallerySection_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingGalleryImage" ADD CONSTRAINT "ListingGalleryImage_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ListingGallerySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
