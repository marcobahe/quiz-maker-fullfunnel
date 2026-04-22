import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export class ApiError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Map Prisma errors to appropriate HTTP responses.
 * Returns null if error is not a known Prisma error.
 */
function prismaErrorResponse(error, context = {}) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { route = 'unknown', method = 'unknown', userId = null } = context;
    const logPayload = {
      route,
      method,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
      meta: error.meta,
    };

    if (error.code === 'P2002') {
      // Unique constraint violation → 409 Conflict
      console.error('[API] Prisma conflict:', JSON.stringify(logPayload));
      return NextResponse.json(
        { error: 'Recurso já existe ou conflito de dados.', code: 'CONFLICT' },
        { status: 409 }
      );
    }

    if (error.code === 'P2025') {
      // Record not found → 404
      console.error('[API] Prisma not found:', JSON.stringify(logPayload));
      return NextResponse.json(
        { error: 'Registro não encontrado.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (['P2000', 'P2006', 'P2007', 'P2011', 'P2012', 'P2013'].includes(error.code)) {
      // Bad input / constraint → 400 Bad Request
      console.error('[API] Prisma bad request:', JSON.stringify(logPayload));
      return NextResponse.json(
        { error: 'Dados inválidos na requisição.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // Other Prisma errors → 500
    console.error('[API] Prisma error:', JSON.stringify(logPayload));
    return NextResponse.json(
      { error: 'Erro de banco de dados.', code: 'DB_ERROR' },
      { status: 500 }
    );
  }

  return null;
}

/**
 * Centralized error handler for API routes.
 *
 * Usage:
 *   } catch (error) {
 *     return handleApiError(error, { route: '/api/quizzes', method: 'GET', userId });
 *   }
 */
export function handleApiError(error, context = {}) {
  const { route = 'unknown', method = 'unknown', userId = null } = context;

  // Handle first-class ApiErrors
  if (error instanceof ApiError) {
    console.error('[API] ApiError:', JSON.stringify({
      route,
      method,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
      statusCode: error.statusCode,
    }));
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  const prismaResponse = prismaErrorResponse(error, context);
  if (prismaResponse) return prismaResponse;

  // Fallback: unexpected error
  console.error('[API] Unexpected error:', JSON.stringify({
    route,
    method,
    userId,
    errorMessage: error?.message,
    errorName: error?.name,
  }));
  return NextResponse.json(
    { error: 'Erro interno do servidor.', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
