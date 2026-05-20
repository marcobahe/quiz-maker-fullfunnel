import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/apiError';
import { z } from 'zod';

const consentUpdateSchema = z.object({
  marketingConsent: z.boolean(),
  pageUrl: z.string().max(2048).optional(),
});

function extractIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  );
}

function getUserAgent(request) {
  return request.headers.get('user-agent') ?? null;
}

// GET /api/user/consent — retorna consent status + history
export async function GET(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        marketingConsentAt: true,
        marketingConsentIp: true,
        marketingConsentUserAgent: true,
        termsConsentAt: true,
        privacyConsentAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const history = await prisma.consentAudit.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      marketingConsent: !!user.marketingConsentAt,
      termsConsent: !!user.termsConsentAt,
      privacyConsent: !!user.privacyConsentAt,
      marketingConsentAt: user.marketingConsentAt,
      marketingConsentIp: user.marketingConsentIp,
      marketingConsentUserAgent: user.marketingConsentUserAgent,
      termsConsentAt: user.termsConsentAt,
      privacyConsentAt: user.privacyConsentAt,
      history,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/user/consent', method: 'GET', userId: session?.user?.id });
  }
}

// PUT /api/user/consent — update marketing consent (grant or revoke)
export async function PUT(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const rawBody = await request.json();
    const parsed = consentUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { marketingConsent, pageUrl } = parsed.data;
    const userId = session.user.id;
    const ip = extractIp(request);
    const userAgent = getUserAgent(request);
    const now = new Date();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        marketingConsentAt: true,
        termsConsentAt: true,
        privacyConsentAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Determine action and update data
    const currentlyHasConsent = !!user.marketingConsentAt;
    let action;
    let updateData = {};

    if (marketingConsent && !currentlyHasConsent) {
      // Granting consent
      action = 'granted';
      updateData = {
        marketingConsentAt: now,
        marketingConsentIp: ip,
        marketingConsentUserAgent: userAgent,
      };
    } else if (!marketingConsent && currentlyHasConsent) {
      // Revoking consent
      action = 'revoked';
      updateData = {
        marketingConsentAt: null,
        marketingConsentIp: null,
        marketingConsentUserAgent: null,
      };
    } else {
      // No change
      return NextResponse.json({
        marketingConsent: !!user.marketingConsentAt,
        termsConsent: !!user.termsConsentAt,
        privacyConsent: !!user.privacyConsentAt,
        message: 'Nenhuma alteração necessária',
      });
    }

    // Atomic: update user + create audit record
    const [, updatedUser] = await prisma.$transaction([
      prisma.consentAudit.create({
        data: {
          userId,
          consentType: 'marketing',
          action,
          ipAddress: ip,
          userAgent,
          pageUrl: pageUrl ?? null,
          metadata: JSON.stringify({
            previousConsentAt: user.marketingConsentAt?.toISOString() ?? null,
          }),
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          marketingConsentAt: true,
          marketingConsentIp: true,
          marketingConsentUserAgent: true,
          termsConsentAt: true,
          privacyConsentAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      marketingConsent: !!updatedUser.marketingConsentAt,
      termsConsent: !!updatedUser.termsConsentAt,
      privacyConsent: !!updatedUser.privacyConsentAt,
      marketingConsentAt: updatedUser.marketingConsentAt,
      marketingConsentIp: updatedUser.marketingConsentIp,
      marketingConsentUserAgent: updatedUser.marketingConsentUserAgent,
      termsConsentAt: updatedUser.termsConsentAt,
      privacyConsentAt: updatedUser.privacyConsentAt,
      action,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/user/consent', method: 'PUT', userId: session?.user?.id });
  }
}
