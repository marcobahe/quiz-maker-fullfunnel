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

const dbUrl = buildDatabaseUrl();

/**
 * When DATABASE_URL is missing (e.g. during `next build` page-data collection),
 * we must NOT instantiate PrismaClient at all — even without the datasources
 * option, PrismaClient reads the env var at construction time and throws
 * PrismaClientConstructorValidationError.
 *
 * We return a Proxy that lazily creates the real client on first property
 * access. If the URL is still missing at that point, we throw a clear error.
 */
function createPrisma() {
  if (dbUrl) {
    return new PrismaClient({
      datasourceUrl: dbUrl,
      log:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn']
          : ['query', 'error', 'warn'],
      errorFormat: 'minimal',
    });
  }

  // No DATABASE_URL — return a proxy that throws on any method call.
  return new Proxy(
    {},
    {
      get(_target, prop) {
        return () => {
          throw new Error(
            'DATABASE_URL não está configurada. Verifique as variáveis de ambiente.'
          );
        };
      },
    }
  );
}

const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
