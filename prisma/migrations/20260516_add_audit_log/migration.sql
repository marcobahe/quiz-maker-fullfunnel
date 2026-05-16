-- CreateTable AuditLog
-- Retention: 2 years. Purge via: DELETE FROM "AuditLog" WHERE "createdAt" < NOW() - INTERVAL '2 years';
CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL,
    "userId"     TEXT,
    "action"     TEXT NOT NULL,
    "resource"   TEXT NOT NULL,
    "resourceId" TEXT,
    "oldValue"   TEXT,
    "newValue"   TEXT,
    "ipAddress"  TEXT,
    "userAgent"  TEXT,
    "metadata"   TEXT NOT NULL DEFAULT '{}',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "AuditLog_userId_idx"              ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx"              ON "AuditLog"("action");
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");
CREATE INDEX "AuditLog_createdAt_idx"           ON "AuditLog"("createdAt");
