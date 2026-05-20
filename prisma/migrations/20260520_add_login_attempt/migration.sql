-- CreateTable LoginAttempt
-- Retention: 90 days (purge job deletes rows where createdAt < now() - INTERVAL '90 days')
CREATE TABLE "LoginAttempt" (
    "id"         TEXT         NOT NULL,
    "userId"     TEXT,
    "email"      TEXT,
    "ipAddress"  TEXT,
    "userAgent"  TEXT,
    "success"    BOOLEAN      NOT NULL,
    "authMethod" TEXT         NOT NULL DEFAULT 'credentials',
    "failReason" TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_idx"                     ON "LoginAttempt"("userId");
CREATE INDEX "LoginAttempt_email_idx"                      ON "LoginAttempt"("email");
CREATE INDEX "LoginAttempt_success_idx"                    ON "LoginAttempt"("success");
CREATE INDEX "LoginAttempt_createdAt_idx"                  ON "LoginAttempt"("createdAt");
CREATE INDEX "LoginAttempt_ipAddress_success_createdAt_idx" ON "LoginAttempt"("ipAddress", "success", "createdAt");
