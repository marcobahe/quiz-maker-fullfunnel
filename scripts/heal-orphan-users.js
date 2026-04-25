#!/usr/bin/env node
/**
 * heal-orphan-users.js
 *
 * Finds users who have no WorkspaceMember with role=owner and creates a
 * personal workspace for each one.
 *
 * Usage:
 *   DATABASE_URL=<direct-neon-url> node scripts/heal-orphan-users.js [--dry-run]
 *
 * Always run with --dry-run first to see what would be created.
 */

import { PrismaClient } from '@prisma/client';

const dryRun = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

async function main() {
  console.log(`[heal-orphan-users] dry-run=${dryRun}`);

  // Find users who have no workspace membership with role=owner
  const orphans = await prisma.user.findMany({
    where: {
      workspaceMembers: {
        none: { role: 'owner' },
      },
    },
    select: { id: true, email: true, name: true },
  });

  console.log(`Found ${orphans.length} orphan user(s).`);

  if (orphans.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  for (const user of orphans) {
    console.log(`  - ${user.email} (${user.id})`);
    if (dryRun) continue;

    const name = user.name || user.email.split('@')[0];
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

    await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug,
        ownerId: user.id,
        members: { create: { userId: user.id, role: 'owner' } },
      },
    });

    // Assign existing quizzes that have no workspace
    const updated = await prisma.quiz.updateMany({
      where: { userId: user.id, workspaceId: null },
      data: { workspaceId: (await prisma.workspace.findFirst({ where: { ownerId: user.id } }))?.id },
    });

    console.log(`    ✓ workspace created. Quizzes reassigned: ${updated.count}`);
  }

  if (!dryRun) {
    console.log('Done.');
  } else {
    console.log('[dry-run] no changes written.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
