import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';
import prisma from './prisma';

const ROLE_HIERARCHY = { owner: 4, admin: 3, editor: 2, viewer: 1 };

/**
 * Check if session user is admin or owner
 * @param {object} session - NextAuth session
 * @returns {boolean}
 */
export function isAdmin(session) {
  return session?.user?.role === 'admin' || session?.user?.role === 'owner';
}

/**
 * Check if session user is the owner
 * @param {object} session - NextAuth session
 * @returns {boolean}
 */
export function isOwner(session) {
  return session?.user?.role === 'owner';
}

/**
 * Check if user is currently impersonating
 * @param {object} session - NextAuth session
 * @returns {boolean}
 */
export function isImpersonating(session) {
  return !!session?.user?.impersonatingAs;
}

/**
 * Get the real user ID (even when impersonating)
 * @param {object} session - NextAuth session
 * @returns {string}
 */
export function getRealUserId(session) {
  return session?.user?.originalUserId || session?.user?.id;
}

/**
 * Require admin role - returns error response if not admin
 * @param {object} session - NextAuth session
 * @returns {NextResponse|null} - null if authorized, error response if not
 */
export function requireAdmin(session) {
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Acesso negado - requer admin' }, { status: 403 });
  }
  return null;
}

/**
 * Require owner role - returns error response if not owner
 * @param {object} session - NextAuth session
 * @returns {NextResponse|null} - null if authorized, error response if not
 */
export function requireOwner(session) {
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  if (!isOwner(session)) {
    return NextResponse.json({ error: 'Acesso negado - requer owner' }, { status: 403 });
  }
  return null;
}

/**
 * Helper to get session and check admin in one call
 * @returns {Promise<{session: object, error: NextResponse|null}>}
 */
export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  const error = requireAdmin(session);
  return { session, error };
}

/**
 * Helper to get session and check owner in one call
 * @returns {Promise<{session: object, error: NextResponse|null}>}
 */
export async function getOwnerSession() {
  const session = await getServerSession(authOptions);
  const error = requireOwner(session);
  return { session, error };
}

/**
 * Check workspace access with SaaS admin bypass.
 * SaaS admins (owner/admin) have full access to ALL workspaces for support purposes.
 * Returns a synthetic member object with role 'owner' for SaaS admins.
 *
 * @param {string} workspaceId - Workspace ID to check
 * @param {string} userId - User ID to check
 * @param {string} minRole - Minimum workspace role required ('viewer'|'editor'|'admin'|'owner')
 * @param {object} session - NextAuth session (needed to check SaaS role)
 * @returns {Promise<object|null>} - Member object if authorized, null if not
 */
export async function checkWorkspaceAccess(workspaceId, userId, minRole = 'viewer', session = null) {
  // SaaS admin bypass — owner/admin have full access to all workspaces
  if (session && isAdmin(session)) {
    return { id: '__saas_admin__', role: 'owner', workspaceId, userId, isSaasAdmin: true };
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) return null;

  if ((ROLE_HIERARCHY[member.role] || 0) < (ROLE_HIERARCHY[minRole] || 0)) return null;

  return member;
}
