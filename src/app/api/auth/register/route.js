import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { ensurePersonalWorkspace } from '@/lib/workspace';
import { checkRateLimit } from '@/lib/rateLimit';
import { registerSchema } from '@/lib/schemas/auth.schema';
import { handleApiError } from '@/lib/apiError';

export async function POST(request) {
  try {
    // Rate limit: 3 registrations per IP per minute
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rl = await checkRateLimit(`register:${ip}`, { max: 3, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfter) },
        }
      );
    }

    const rawBody = await request.json();
    const parsed = registerSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está em uso' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name || null,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        },
      });

      // Auto-create personal workspace — runs inside transaction so user is
      // rolled back if workspace creation fails (prevents orphaned users)
      await ensurePersonalWorkspace(newUser.id, tx);

      return newUser;
    });

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, { route: '/api/auth/register', method: 'POST', userId: null });
  }
}
