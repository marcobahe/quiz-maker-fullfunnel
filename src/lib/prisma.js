import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis;

/**
 * Build a pg.Pool config from DATABASE_URL, stripping Prisma-specific
 * URL parameters (pgbouncer, connection_limit, pool_timeout) that pg doesn't
 * understand, and re-expressing them as native Pool options.
 *
 * In Prisma 7, connection pooling is handled by the @prisma/adapter-pg driver
 * adapter rather than by the Prisma query engine. The raw DATABASE_URL may
 * still contain PgBouncer/Supabase params — we parse and extract them here.
 */
function buildPoolConfig() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return null;

  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    // Unparsable URL — return as-is and let pg fail with a clear error
    return { connectionString: baseUrl, max: 10, connectionTimeoutMillis: 10_000 };
  }

  // Extract Prisma-specific params before passing to pg
  const connectionLimit = parseInt(url.searchParams.get('connection_limit') ?? '10', 10);
  const poolTimeout = parseInt(url.searchParams.get('pool_timeout') ?? '10', 10);

  url.searchParams.delete('pgbouncer');
  url.searchParams.delete('connection_limit');
  url.searchParams.delete('pool_timeout');

  return {
    connectionString: url.toString(),
    max: connectionLimit,
    connectionTimeoutMillis: poolTimeout * 1_000,
  };
}

/**
 * When DATABASE_URL is missing (e.g. during `next build` page-data collection),
 * we must NOT instantiate PrismaClient at all. We return a Proxy that throws
 * on first use so static build steps can proceed without a real DB connection.
 */
function createPrisma() {
  const poolConfig = buildPoolConfig();

  if (poolConfig) {
    const pool = new Pool(poolConfig);
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
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
      get(_target, _prop) {
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
