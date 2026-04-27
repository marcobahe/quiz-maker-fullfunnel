import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const error = requireAdmin(session);
  if (error) return error;

  const gcid = process.env.GOOGLE_CLIENT_ID || '';
  const gcs = process.env.GOOGLE_CLIENT_SECRET || '';

  return NextResponse.json({
    GOOGLE_CLIENT_ID_present: !!gcid,
    GOOGLE_CLIENT_ID_length: gcid.length,
    GOOGLE_CLIENT_ID_startsWith_ws: /^\s/.test(gcid),
    GOOGLE_CLIENT_ID_endsWith_ws: /\s$/.test(gcid),
    GOOGLE_CLIENT_ID_first_char: gcid.charCodeAt(0),
    GOOGLE_CLIENT_ID_last_char: gcid.charCodeAt(gcid.length - 1),
    GOOGLE_CLIENT_SECRET_present: !!gcs,
    GOOGLE_CLIENT_SECRET_length: gcs.length,
    GOOGLE_CLIENT_SECRET_startsWith_ws: /^\s/.test(gcs),
    GOOGLE_CLIENT_SECRET_endsWith_ws: /\s$/.test(gcs),
    GOOGLE_CLIENT_SECRET_first_char: gcs.charCodeAt(0),
    GOOGLE_CLIENT_SECRET_last_char: gcs.charCodeAt(gcs.length - 1),
    NEXTAUTH_SECRET_present: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET_length: process.env.NEXTAUTH_SECRET?.length || 0,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });
}
