-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "paywallEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paywallPrice" INTEGER,
ADD COLUMN     "paywallType" TEXT,
ADD COLUMN     "paywallStripePriceId" TEXT,
ADD COLUMN     "paywallTitle" TEXT,
ADD COLUMN     "paywallDescription" TEXT;
