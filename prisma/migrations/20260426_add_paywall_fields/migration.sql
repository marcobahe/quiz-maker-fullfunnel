-- AddColumn Quiz: paywall fields
ALTER TABLE "Quiz" ADD COLUMN "paywallEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Quiz" ADD COLUMN "paywallPrice" INTEGER;
ALTER TABLE "Quiz" ADD COLUMN "paywallType" TEXT;
ALTER TABLE "Quiz" ADD COLUMN "paywallStripePriceId" TEXT;
ALTER TABLE "Quiz" ADD COLUMN "paywallTitle" TEXT;
ALTER TABLE "Quiz" ADD COLUMN "paywallDescription" TEXT;

-- CreateTable QuizPurchase
CREATE TABLE "QuizPurchase" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "QuizPurchase_quizId_email_key" ON "QuizPurchase"("quizId", "email");

-- CreateIndex
CREATE INDEX "QuizPurchase_quizId_idx" ON "QuizPurchase"("quizId");
CREATE INDEX "QuizPurchase_email_idx" ON "QuizPurchase"("email");
CREATE INDEX "QuizPurchase_status_idx" ON "QuizPurchase"("status");

-- AddForeignKey
ALTER TABLE "QuizPurchase" ADD CONSTRAINT "QuizPurchase_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
