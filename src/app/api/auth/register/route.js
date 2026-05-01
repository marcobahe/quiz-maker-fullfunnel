import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { ensurePersonalWorkspace } from '@/lib/workspace';
import { checkRateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/getClientIp';
import { registerSchema } from '@/lib/schemas/auth.schema';
import { handleApiError } from '@/lib/apiError';

export async function POST(request) {
  try {
    // Rate limit: 3 registrations per IP per minute
    const ip =
      getClientIp(request);
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

    let rawBody;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Dados inválidos', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }
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

    // Atomic: user creation + workspace creation in one transaction.
    // If workspace creation fails the user is rolled back — no orphan users.
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: name || null,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
        },
      });
      await ensurePersonalWorkspace(created.id, tx);
      return created;
    });

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, { route: '/api/auth/register', method: 'POST', userId: null });
  }
}
