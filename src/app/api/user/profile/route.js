import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// GET /api/user/profile — retorna dados do perfil do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT /api/user/profile — atualiza dados do perfil
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword, image } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const updateData = {};

    // Atualizar nome
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    // Atualizar email
    if (email !== undefined && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Este email já está em uso' }, { status: 409 });
      }
      updateData.email = email.toLowerCase().trim();
    }

    // Atualizar senha
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
      }

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
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE /api/user/profile — excluir conta
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
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
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Erro ao excluir conta' }, { status: 500 });
  }
}
