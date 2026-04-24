import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cleanupQuizUploads } from '@/lib/uploadthing-cleanup';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/apiError';
import { checkRateLimit } from '@/lib/rateLimit';
import { updateProfileSchema } from '@/lib/schemas/userProfile.schema';

// GET /api/user/profile — retorna dados do perfil do usuário
export async function GET() {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        role: true,
        createdAt: true,
        // Indica se tem senha (login com email) ou é OAuth-only
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      plan: user.plan,
      role: user.role,
      createdAt: user.createdAt,
      hasPassword: !!user.password,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/user/profile', method: 'GET', userId: session?.user?.id });
  }
}

// PUT /api/user/profile — atualiza dados do perfil
export async function PUT(request) {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Rate limit: 10 profile updates per user per minute
    const rl = checkRateLimit(`profile:update:${session.user.id}`, { max: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em instantes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const rawBody = await request.json();
    const parsed = updateProfileSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, currentPassword, newPassword, image } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const updateData = {};

    // Atualizar nome
    if (name !== undefined) {
      updateData.name = name.trim();
    }

    // Atualizar email
    if (email !== undefined && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 });
      }
      updateData.email = email.toLowerCase().trim();
    }

    // Atualizar senha
    if (newPassword) {
      // Se o usuário já tem senha, exige a senha atual
      if (user.password) {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Informe a senha atual' }, { status: 400 });
        }
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 403 });
        }
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Atualizar avatar
    if (image !== undefined) {
      updateData.image = image;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum dado para atualizar' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, { route: '/api/user/profile', method: 'PUT', userId: session?.user?.id });
  }
}

// DELETE /api/user/profile — excluir conta
export async function DELETE() {
  let session;
  try {
    session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Deletar dados relacionados primeiro
    await prisma.$transaction([
      prisma.workspaceMember.deleteMany({ where: { userId: session.user.id } }),
      prisma.quiz.deleteMany({ where: { userId: session.user.id } }),
      prisma.workspace.deleteMany({ where: { ownerId: session.user.id } }),
      prisma.user.delete({ where: { id: session.user.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: '/api/user/profile', method: 'DELETE', userId: session?.user?.id });
  }
}
