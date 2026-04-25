-- AddColumn: ghlApiKey (encrypted, nullable) and ghlSyncStatus with default
ALTER TABLE "Workspace" ADD COLUMN "ghlApiKey" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "ghlSyncStatus" TEXT NOT NULL DEFAULT 'not_configured';
