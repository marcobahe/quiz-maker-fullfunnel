-- AddColumn mfaEnabled
ALTER TABLE "User" ADD COLUMN "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AddColumn mfaSecret (nullable)
ALTER TABLE "User" ADD COLUMN "mfaSecret" TEXT;

-- AddColumn mfaBackupCodes (nullable)
ALTER TABLE "User" ADD COLUMN "mfaBackupCodes" TEXT;
