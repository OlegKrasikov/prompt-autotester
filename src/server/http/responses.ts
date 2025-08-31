import { NextResponse } from 'next/server';

export function okJson(data: unknown, init?: number | ResponseInit) {
  const opts: ResponseInit | undefined = typeof init === 'number' ? { status: init } : init;
  return NextResponse.json(data as any, opts);
}

export function errorJson(
  message: string,
  options?: { status?: number; code?: string; details?: unknown; userMessage?: string },
) {
  const status = options?.status ?? 400;
  const payload = {
    error: {
      message,
      code: options?.code ?? 'BAD_REQUEST',
      userMessage: options?.userMessage,
      details: options?.details,
    },
  };
  return NextResponse.json(payload as any, { status });
}

export function unauthorized(message = 'Unauthorized') {
  return errorJson(message, { status: 401, code: 'UNAUTHORIZED' });
}

export function notFound(message = 'Not found') {
  return errorJson(message, { status: 404, code: 'NOT_FOUND' });
}

export function serverError(message = 'Internal server error', details?: unknown) {
  return errorJson(message, { status: 500, code: 'INTERNAL', details });
}
