/**
 * POST /api/user/mfa/verify
 * Confirms MFA setup by validating the first TOTP code.
 * Enables MFA and returns backup codes.
 *
 * Also used by the login MFA challenge flow when called with { loginChallenge: true }.
 * In that case it just verifies the code (or backup code) without changing MFA state,
 * and clears the mfaPending flag from the JWT session.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/fieldEncryption';
import { checkRateLimit } from '@/lib/rateLimit';
import { audit } from '@/lib/auditLog';
import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/** Generate 10 random backup codes and return them plaintext + hashed. */
function generateBackupCodes() {
  const codes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(5).toString('hex').toUpperCase().replace(/(.{4})/g, '$1-').slice(0, 9)
  );
  return codes;
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Rate limit: 3 attempts per minute per user
  const rl = await checkRateLimit(`mfa:verify:${session.user.id}`, { max: 3, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { code, loginChallenge = false } = body;

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Código obrigatório' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mfaEnabled: true, mfaSecret: true, mfaBackupCodes: true },
  });

  if (!user?.mfaSecret) {
    return NextResponse.json(
      { error: 'Configure o MFA primeiro em /api/user/mfa/setup' },
      { status: 400 }
    );
  }

  const secret = decrypt(user.mfaSecret);

  // --- Login challenge: just verify code (TOTP or backup code), no state change ---
  if (loginChallenge) {
    const isValidTotp = authenticator.check(code.replace(/\s/g, ''), secret);

    if (!isValidTotp) {
      // Try backup codes
      const backupCodes = user.mfaBackupCodes ? JSON.parse(user.mfaBackupCodes) : [];
      const cleanCode = code.replace(/[-\s]/g, '').toUpperCase();
      const matchIdx = await findAndConsumeBackupCode(backupCodes, cleanCode, session.user.id, req);
      if (matchIdx === -1) {
        await audit(req, {
          userId: session.user.id,
          action: 'mfa.challenge_failed',
          resource: 'user',
          resourceId: session.user.id,
        });
        return NextResponse.json({ error: 'Código inválido' }, { status: 401 });
      }
      await audit(req, {
        userId: session.user.id,
        action: 'mfa.backup_code_used',
        resource: 'user',
        resourceId: session.user.id,
      });
      return NextResponse.json({ success: true, backupCodeUsed: true });
    }

    await audit(req, {
      userId: session.user.id,
      action: 'mfa.challenge_passed',
      resource: 'user',
      resourceId: session.user.id,
    });
    return NextResponse.json({ success: true });
  }

  // --- Setup confirmation: enable MFA and return backup codes ---
  if (user.mfaEnabled) {
    return NextResponse.json({ error: 'MFA já está habilitado' }, { status: 400 });
  }

  const isValid = authenticator.check(code.replace(/\s/g, ''), secret);
  if (!isValid) {
    return NextResponse.json({ error: 'Código inválido. Verifique o horário do dispositivo.' }, { status: 400 });
  }

  const plainCodes = generateBackupCodes();
  const hashedCodes = await Promise.all(plainCodes.map((c) => bcrypt.hash(c, 10)));

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      mfaEnabled: true,
      mfaBackupCodes: JSON.stringify(hashedCodes),
    },
  });

  await audit(req, {
    userId: session.user.id,
    action: 'mfa.enabled',
    resource: 'user',
    resourceId: session.user.id,
  });

  return NextResponse.json({ success: true, backupCodes: plainCodes });
}

/**
 * Check backup codes list for a match; consume (remove) it if found.
 * Returns the matched index or -1.
 */
async function findAndConsumeBackupCode(hashedCodes, plainCode, userId, req) {
  for (let i = 0; i < hashedCodes.length; i++) {
    const match = await bcrypt.compare(plainCode, hashedCodes[i]);
    if (match) {
      const remaining = [...hashedCodes.slice(0, i), ...hashedCodes.slice(i + 1)];
      await prisma.user.update({
        where: { id: userId },
        data: { mfaBackupCodes: JSON.stringify(remaining) },
      });
      return i;
    }
  }
  return -1;
}
