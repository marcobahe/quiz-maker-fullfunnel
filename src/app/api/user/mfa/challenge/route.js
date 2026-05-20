/**
 * POST /api/user/mfa/challenge
 * Called from the /login/mfa page after the user enters their TOTP code.
 * Verifies the code and, on success, signals the JWT to clear mfaPending.
 * The client must then call `update({ mfaVerified: true })` via useSession to flush the JWT.
 *
 * Rate limited: 3 attempts/min per user.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/fieldEncryption';
import { checkRateLimit } from '@/lib/rateLimit';
import { audit, logLoginAttempt } from '@/lib/auditLog';
import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (!session.user.mfaPending) {
    return NextResponse.json({ error: 'Nenhum desafio MFA pendente' }, { status: 400 });
  }

  // Rate limit: 3 attempts per minute per user
  const rl = await checkRateLimit(`mfa:challenge:${session.user.id}`, { max: 3, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em 1 minuto.' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { code } = body;

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Código obrigatório' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mfaSecret: true, mfaBackupCodes: true },
  });

  if (!user?.mfaSecret) {
    return NextResponse.json({ error: 'MFA não configurado' }, { status: 400 });
  }

  const secret = decrypt(user.mfaSecret);
  const isValidTotp = authenticator.check(code.replace(/\s/g, ''), secret);

  if (!isValidTotp) {
    // Try backup codes
    const backupCodes = user.mfaBackupCodes ? JSON.parse(user.mfaBackupCodes) : [];
    const cleanCode = code.replace(/[-\s]/g, '').toUpperCase();
    let consumed = false;
    const remaining = [];
    for (const hashed of backupCodes) {
      if (!consumed && (await bcrypt.compare(cleanCode, hashed))) {
        consumed = true;
        // don't push — consumed
      } else {
        remaining.push(hashed);
      }
    }
    if (!consumed) {
      await audit(req, {
        userId: session.user.id,
        action: 'mfa.challenge_failed',
        resource: 'user',
        resourceId: session.user.id,
      });
      return NextResponse.json({ error: 'Código inválido' }, { status: 401 });
    }
    // Consume the backup code
    await prisma.user.update({
      where: { id: session.user.id },
      data: { mfaBackupCodes: JSON.stringify(remaining) },
    });
    await audit(req, {
      userId: session.user.id,
      action: 'mfa.backup_code_used',
      resource: 'user',
      resourceId: session.user.id,
    });
  }

  await logLoginAttempt(req, { userId: session.user.id, success: true, authMethod: 'mfa' });

  return NextResponse.json({ success: true });
}
