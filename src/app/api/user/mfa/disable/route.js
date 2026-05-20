/**
 * POST /api/user/mfa/disable
 * Disables MFA for the current user.
 * Requires a valid TOTP code OR a backup code to confirm intent.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/fieldEncryption';
import { checkRateLimit } from '@/lib/rateLimit';
import { audit } from '@/lib/auditLog';
import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Rate limit: 3 attempts per minute per user
  const rl = await checkRateLimit(`mfa:disable:${session.user.id}`, { max: 3, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { code } = body;

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Código obrigatório para desabilitar MFA' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mfaEnabled: true, mfaSecret: true, mfaBackupCodes: true },
  });

  if (!user?.mfaEnabled) {
    return NextResponse.json({ error: 'MFA não está habilitado' }, { status: 400 });
  }

  const secret = decrypt(user.mfaSecret);
  const isValidTotp = authenticator.check(code.replace(/\s/g, ''), secret);

  if (!isValidTotp) {
    // Try backup codes
    const backupCodes = user.mfaBackupCodes ? JSON.parse(user.mfaBackupCodes) : [];
    const cleanCode = code.replace(/[-\s]/g, '').toUpperCase();
    let matched = false;
    for (const hashed of backupCodes) {
      if (await bcrypt.compare(cleanCode, hashed)) {
        matched = true;
        break;
      }
    }
    if (!matched) {
      await audit(req, {
        userId: session.user.id,
        action: 'mfa.disable_failed',
        resource: 'user',
        resourceId: session.user.id,
      });
      return NextResponse.json({ error: 'Código inválido' }, { status: 401 });
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
    },
  });

  await audit(req, {
    userId: session.user.id,
    action: 'mfa.disabled',
    resource: 'user',
    resourceId: session.user.id,
  });

  return NextResponse.json({ success: true });
}
