import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

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
