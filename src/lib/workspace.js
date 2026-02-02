import prisma from './prisma';

/**
 * Ensures a user has a personal workspace. Creates one if not.
 * Returns the personal workspace.
 */
export async function ensurePersonalWorkspace(userId) {
  // Check if user already has an owned workspace
  const existing = await prisma.workspace.findFirst({
    where: {
      ownerId: userId,
      members: {
        some: {
          userId,
          role: 'owner',
        },
      },
    },
  });

  if (existing) return existing;

  // Get user info for naming
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const name = user.name || user.email.split('@')[0];
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

  const workspace = await prisma.workspace.create({
    data: {
      name: `${name}'s Workspace`,
      slug,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: 'owner',
        },
      },
    },
  });

  // Assign existing quizzes (without workspace) to this workspace
  await prisma.quiz.updateMany({
    where: {
      userId,
      workspaceId: null,
    },
    data: {
      workspaceId: workspace.id,
    },
  });

  return workspace;
}

/**
 * Get all workspaces a user belongs to.
 */
export async function getUserWorkspaces(userId) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, quizzes: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
  }));
}
