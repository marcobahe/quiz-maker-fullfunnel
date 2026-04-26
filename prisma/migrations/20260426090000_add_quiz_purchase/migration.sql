-- CreateTable
CREATE TABLE "QuizPurchase" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "amount" INTEGER,
    "currency" TEXT,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizPurchase_stripeSessionId_key" ON "QuizPurchase"("stripeSessionId");

-- CreateIndex
CREATE INDEX "QuizPurchase_quizId_idx" ON "QuizPurchase"("quizId");

-- CreateIndex
CREATE INDEX "QuizPurchase_quizId_customerEmail_idx" ON "QuizPurchase"("quizId", "customerEmail");

-- CreateIndex
CREATE INDEX "QuizPurchase_status_idx" ON "QuizPurchase"("status");

-- CreateIndex
CREATE INDEX "QuizPurchase_createdAt_idx" ON "QuizPurchase"("createdAt");

-- AddForeignKey
ALTER TABLE "QuizPurchase" ADD CONSTRAINT "QuizPurchase_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
