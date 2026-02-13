/*
  Warnings:

  - Added the required column `pricePerNight` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "adults" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "children" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cleaningFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "infants" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "nights" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "pets" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pricePerNight" INTEGER NOT NULL,
ADD COLUMN     "serviceFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" INTEGER NOT NULL,
ADD COLUMN     "taxAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taxPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0;
