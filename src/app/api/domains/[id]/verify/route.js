import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { publishDomainMapping, removeDomainMapping } from '@/lib/cloudflare-kv';
import dns from 'dns';

const resolveCname = dns.promises.resolveCname;

// POST /api/domains/[id]/verify — verify DNS CNAME
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const domain = await prisma.customDomain.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!domain) {
      return NextResponse.json({ error: 'Domínio não encontrado' }, { status: 404 });
    }

    // Perform DNS CNAME lookup
    let verified = false;
    let dnsResult = null;
    let errorMessage = null;

    try {
      const records = await resolveCname(domain.domain);
      dnsResult = records;

      // Check if any CNAME record points to our target
      const target = domain.cnameTarget.toLowerCase().replace(/\.$/, '');
      verified = records.some(
        (record) => record.toLowerCase().replace(/\.$/, '') === target
      );

      if (!verified) {
        errorMessage = `CNAME encontrado (${records.join(', ')}), mas não aponta para ${domain.cnameTarget}`;
      }
    } catch (dnsError) {
      if (dnsError.code === 'ENODATA' || dnsError.code === 'ENOTFOUND') {
        errorMessage = 'Nenhum registro CNAME encontrado. Verifique se o DNS foi configurado corretamente.';
      } else if (dnsError.code === 'ETIMEOUT') {
        errorMessage = 'Timeout na consulta DNS. Tente novamente em alguns minutos.';
      } else {
        errorMessage = `Erro na verificação DNS: ${dnsError.message}`;
      }
    }

    // Update verified status
    const updated = await prisma.customDomain.update({
      where: { id },
      data: { verified },
      include: {
        quiz: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    // If verified and has a published quiz → publish domain mapping to edge
    if (verified && updated.quiz?.slug && updated.quiz?.status === 'published') {
      publishDomainMapping(updated.domain, updated.quiz.slug, updated.quiz.id).catch(() => {});
    }

    // If was verified before and now is not → remove mapping
    if (!verified && domain.verified) {
      removeDomainMapping(domain.domain).catch(() => {});
    }

    return NextResponse.json({
      ...updated,
      dnsResult,
      errorMessage: verified ? null : errorMessage,
    });
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
