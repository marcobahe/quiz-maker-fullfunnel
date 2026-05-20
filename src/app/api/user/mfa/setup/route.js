/**
 * POST /api/user/mfa/setup
 * Generates a new TOTP secret and returns the QR code data URL.
 * Does NOT enable MFA yet — caller must call /api/user/mfa/verify to confirm.
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/fieldEncryption';
import { NextResponse } from 'next/server';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, mfaEnabled: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  if (user.mfaEnabled) {
    return NextResponse.json(
      { error: 'MFA já está habilitado. Desabilite primeiro para reconfigurá-lo.' },
      { status: 400 }
    );
  }

  // Generate a new TOTP secret (not saved yet — saved on verify)
  const secret = authenticator.generateSecret();
  const otpAuthUrl = authenticator.keyuri(user.email, 'QuizMeBaby', secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

  // Temporarily encrypt and store the pending secret so verify can read it
  const encryptedSecret = encrypt(secret);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { mfaSecret: encryptedSecret },
  });

  return NextResponse.json({
    qrCode: qrCodeDataUrl,
    manualKey: secret, // fallback for manual entry in authenticator apps
  });
}
