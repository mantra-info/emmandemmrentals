-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "refundHistory" JSONB[] DEFAULT ARRAY[]::JSONB[];
