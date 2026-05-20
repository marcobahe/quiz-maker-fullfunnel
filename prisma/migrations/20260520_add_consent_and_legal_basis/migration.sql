-- Add consent tracking columns to User
ALTER TABLE "User" ADD COLUMN "marketingConsentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "marketingConsentIp" TEXT;
ALTER TABLE "User" ADD COLUMN "marketingConsentUserAgent" TEXT;
ALTER TABLE "User" ADD COLUMN "termsConsentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "privacyConsentAt" TIMESTAMP(3);

-- Create ConsentAudit table
CREATE TABLE "ConsentAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "pageUrl" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentAudit_pkey" PRIMARY KEY ("id")
);

-- Add foreign key from ConsentAudit to User
ALTER TABLE "ConsentAudit" ADD CONSTRAINT "ConsentAudit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for ConsentAudit
CREATE INDEX "ConsentAudit_userId_idx" ON "ConsentAudit"("userId");
CREATE INDEX "ConsentAudit_consentType_idx" ON "ConsentAudit"("consentType");
CREATE INDEX "ConsentAudit_action_idx" ON "ConsentAudit"("action");
CREATE INDEX "ConsentAudit_createdAt_idx" ON "ConsentAudit"("createdAt");
