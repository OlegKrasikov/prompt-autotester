import type { NextRequest } from 'next/server';

type LogLevel = 'info' | 'warn' | 'error';

function baseLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...(meta || {}),
  } as Record<string, unknown>;
  if (level === 'error') {
    console.error(payload);
  } else if (level === 'warn') {
    console.warn(payload);
  } else {
    console.log(payload);
  }
}

export function getRequestId(req: NextRequest | { headers: Headers }): string | undefined {
  const rid = req.headers.get('x-request-id') || req.headers.get('X-Request-Id');
  return rid ?? undefined;
}

export function getLogger(req?: NextRequest | { headers: Headers }) {
  const requestId = req ? getRequestId(req) : undefined;
  const withRid = (meta?: Record<string, unknown>) => ({ ...(meta || {}), requestId });
  return {
    info: (message: string, meta?: Record<string, unknown>) =>
      baseLog('info', message, withRid(meta)),
    warn: (message: string, meta?: Record<string, unknown>) =>
      baseLog('warn', message, withRid(meta)),
    error: (message: string, meta?: Record<string, unknown>) =>
      baseLog('error', message, withRid(meta)),
  };
}
