-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "amountPaid" INTEGER DEFAULT 0,
ADD COLUMN     "cardBrand" TEXT,
ADD COLUMN     "cardExpMonth" INTEGER,
ADD COLUMN     "cardExpYear" INTEGER,
ADD COLUMN     "cardLast4" TEXT,
ADD COLUMN     "paymentCurrency" TEXT DEFAULT 'usd',
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'unpaid',
ADD COLUMN     "refundStatus" TEXT DEFAULT 'none',
ADD COLUMN     "refundedAmount" INTEGER DEFAULT 0,
ADD COLUMN     "stripeBalanceTransactionId" TEXT,
ADD COLUMN     "stripeChargeId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeRefundIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
