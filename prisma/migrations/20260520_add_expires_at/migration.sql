-- Add expiresAt (TTL) fields for data retention policies.
-- Retention defaults:
--   WhatsappMessageLog : 30 days from createdAt
--   Lead               : 90 days from createdAt (null = preserved; see cleanup job)
--   QuizPurchase       : 90 days after status → 'completed' (set by app; pending rows never expired)
--
-- Cleanup job: scripts/cleanup-expired-records.mjs (run daily via cron)

-- WhatsappMessageLog: expiresAt column + index
ALTER TABLE "WhatsappMessageLog"
  ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Backfill existing rows: 30 days from createdAt
UPDATE "WhatsappMessageLog"
  SET "expiresAt" = "createdAt" + INTERVAL '30 days'
  WHERE "expiresAt" IS NULL;

CREATE INDEX "WhatsappMessageLog_expiresAt_idx" ON "WhatsappMessageLog"("expiresAt");

-- Lead: expiresAt column + index
ALTER TABLE "Lead"
  ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Backfill existing rows: 90 days from createdAt
UPDATE "Lead"
  SET "expiresAt" = "createdAt" + INTERVAL '90 days'
  WHERE "expiresAt" IS NULL;

CREATE INDEX "Lead_expiresAt_idx" ON "Lead"("expiresAt");

-- QuizPurchase: expiresAt column + index
ALTER TABLE "QuizPurchase"
  ADD COLUMN "expiresAt" TIMESTAMP(3);

-- Backfill completed/failed rows: 90 days from updatedAt
UPDATE "QuizPurchase"
  SET "expiresAt" = "updatedAt" + INTERVAL '90 days'
  WHERE "status" IN ('completed', 'failed')
  AND "expiresAt" IS NULL;

CREATE INDEX "QuizPurchase_expiresAt_idx" ON "QuizPurchase"("expiresAt");
