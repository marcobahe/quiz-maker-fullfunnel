/**
 * cleanup-expired-records.mjs
 *
 * Hard-deletes records that have passed their expiresAt TTL.
 *
 * Tables and policies:
 *   WhatsappMessageLog  — 30 days from createdAt
 *   Lead                — 90 days from createdAt; leads linked to a completed QuizPurchase
 *                         (same quizId + email) are preserved (expiresAt set to null by webhook).
 *   QuizPurchase        — 90 days after payment completed; pending rows are never expired.
 *
 * Run daily via cron:
 *   0 3 * * * node /home/marco/quizmebaby/scripts/cleanup-expired-records.mjs
 *
 * Exits with code 0 on success, 1 on error.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  console.log(`[cleanup-expired-records] Starting at ${now.toISOString()}`);

  // ── WhatsApp message logs (30-day TTL) ───────────────────────────────────────
  const { count: waMsgCount } = await prisma.whatsappMessageLog.deleteMany({
    where: {
      expiresAt: { lt: now, not: null },
    },
  });
  console.log(`[cleanup-expired-records] WhatsappMessageLog deleted: ${waMsgCount}`);

  // ── Leads (90-day TTL, completed-purchase leads preserved) ──────────────────
  // Leads where expiresAt is set and past due. The webhook already sets expiresAt = null
  // for any lead with a matching completed QuizPurchase, so a simple filter is sufficient.
  const { count: leadCount } = await prisma.lead.deleteMany({
    where: {
      expiresAt: { lt: now, not: null },
    },
  });
  console.log(`[cleanup-expired-records] Lead deleted: ${leadCount}`);

  // ── QuizPurchase / Stripe session records (90-day TTL, non-pending only) ─────
  const { count: purchaseCount } = await prisma.quizPurchase.deleteMany({
    where: {
      expiresAt: { lt: now, not: null },
      status: { not: 'pending' },
    },
  });
  console.log(`[cleanup-expired-records] QuizPurchase deleted: ${purchaseCount}`);

  console.log(
    `[cleanup-expired-records] Done. Total deleted: ${waMsgCount + leadCount + purchaseCount}`,
  );
}

main()
  .catch((err) => {
    console.error('[cleanup-expired-records] Fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
