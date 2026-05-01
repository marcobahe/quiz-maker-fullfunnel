import { defineConfig } from '@prisma/config';

export default defineConfig({
  /**
   * datasource.url is used by the Prisma CLI (migrate, db push, introspect).
   * Prefer DIRECT_DATABASE_URL (bypasses PgBouncer) so migrations run correctly.
   * Falls back to DATABASE_URL if direct URL is not set.
   */
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
  },

  migrations: {
    /**
     * Seed command moved here from package.json#prisma (deprecated in Prisma 7).
     */
    seed: 'node prisma/seed.mjs',
  },
});
