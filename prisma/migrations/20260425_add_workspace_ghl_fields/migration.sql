-- AddColumn: GHL self-service integration fields
ALTER TABLE "Workspace" ADD COLUMN "ghlApiKey" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "ghlSyncStatus" TEXT NOT NULL DEFAULT 'not_configured';
ALTER TABLE "Workspace" ADD COLUMN "ghlAccountName" TEXT;
ALTER TABLE "Workspace" ADD COLUMN "ghlLocationId" TEXT;
