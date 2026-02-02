import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/quizzes/[id]/integrations/[integrationId] — update
export async function PUT(request, { params }) {
  try {
    const { id: quizId, integrationId } = await params;
    const body = await request.json();

    const existing = await prisma.integration.findFirst({
      where: { id: integrationId, quizId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 });
    }

    const data = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.config !== undefined) data.config = typeof body.config === 'string' ? body.config : JSON.stringify(body.config);
    if (body.active !== undefined) data.active = body.active;
    if (body.type !== undefined) data.type = body.type;

    const updated = await prisma.integration.update({
      where: { id: integrationId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE /api/quizzes/[id]/integrations/[integrationId] — delete
export async function DELETE(request, { params }) {
  try {
    const { id: quizId, integrationId } = await params;

    const existing = await prisma.integration.findFirst({
      where: { id: integrationId, quizId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 });
    }

    await prisma.integration.delete({ where: { id: integrationId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
