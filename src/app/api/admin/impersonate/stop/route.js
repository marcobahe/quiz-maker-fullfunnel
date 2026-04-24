import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/apiError';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Return signal to stop impersonating on client side
    return NextResponse.json({
      success: true,
      stopImpersonating: true,
    });
  } catch (error) {
    return handleApiError(error, { route: '/api/admin/impersonate/stop', method: 'POST', userId: null });
  }
}
