/**
 * cleanup-login-attempts.mjs
 *
 * Deletes LoginAttempt records older than 90 days.
 * Run daily via cron: 0 3 * * * node /path/to/scripts/cleanup-login-attempts.mjs
 *
 * Exits with code 0 on success, 1 on error.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  console.log(`[cleanup-login-attempts] Deleting records older than ${cutoff.toISOString()}`);

  const { count } = await prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  console.log(`[cleanup-login-attempts] Deleted ${count} records.`);
}

main()
  .catch((err) => {
    console.error('[cleanup-login-attempts] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
