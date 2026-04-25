#!/usr/bin/env node
/**
 * heal-orphan-users.js — Idempotent script to create missing personal workspaces.
 *
 * Run AFTER prisma db push / migrate deploy has been applied to prod DB.
 * Safe to run multiple times — ensurePersonalWorkspace is a no-op if workspace exists.
 *
 * Usage:
 *   DATABASE_URL=<direct-neon-url> node scripts/heal-orphan-users.js [--dry-run]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

async function ensurePersonalWorkspace(userId, db) {
  const existing = await db.workspace.findFirst({
    where: {
      ownerId: userId,
      members: { some: { userId, role: 'owner' } },
    },
  });
  if (existing) return { workspace: existing, created: false };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User ${userId} not found`);

  const name = user.name || user.email.split('@')[0];
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

  const workspace = await db.workspace.create({
    data: {
      name: `${name}'s Workspace`,
      slug,
      ownerId: userId,
      members: { create: { userId, role: 'owner' } },
    },
  });

  await db.quiz.updateMany({
    where: { userId, workspaceId: null },
    data: { workspaceId: workspace.id },
  });

  return { workspace, created: true };
}

async function main() {
  console.log(`heal-orphan-users — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  // Find users that have no WorkspaceMember record with role=owner
  const allUsers = await prisma.user.findMany({
    where: {
      workspaceMembers: {
        none: { role: 'owner' },
      },
    },
    select: { id: true, email: true, name: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${allUsers.length} orphan user(s) without personal workspace.\n`);

  if (allUsers.length === 0) {
    console.log('Nothing to heal. Exiting.');
    return;
  }

  let healed = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of allUsers) {
    const label = `${user.email} (${user.id})`;
    if (DRY_RUN) {
      console.log(`[dry-run] Would create workspace for ${label}`);
      skipped++;
      continue;
    }

    try {
      const { created } = await ensurePersonalWorkspace(user.id, prisma);
      if (created) {
        console.log(`[healed]  ${label}`);
        healed++;
      } else {
        console.log(`[skip]    ${label} — workspace already exists`);
        skipped++;
      }
    } catch (err) {
      console.error(`[error]   ${label} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. healed=${healed} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main()
  .catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
