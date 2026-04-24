import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Build DATABASE_URL with pooling parameters for serverless environments.
 * If the URL already contains connection_limit, use as-is.
 * Otherwise append sensible defaults (connection_limit=10, pool_timeout=10, pgbouncer=true).
 */
function buildDatabaseUrl() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return undefined;

  // Already configured — trust the operator
  if (baseUrl.includes('connection_limit=') || baseUrl.includes('pool_timeout=')) {
    return baseUrl;
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}connection_limit=10&pool_timeout=10&pgbouncer=true`;
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },
    log:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['query', 'error', 'warn'],
    errorFormat: 'minimal',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
