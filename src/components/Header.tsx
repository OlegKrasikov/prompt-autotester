'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function Header() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-surface)]/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:px-8 md:px-10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[color:var(--color-accent)]" />
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Prompt Autotester
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-xs text-[color:var(--color-muted-foreground)]">Loading...</span>
          ) : session ? (
            <div className="flex items-center gap-2">
              <span className="text-xs">{session.user?.email ?? session.user?.name ?? 'User'}</span>
              <button
                className="rounded border border-[color:var(--color-border)] px-2 py-1 text-xs hover:bg-[color:var(--color-surface-variant)]"
                onClick={() => authClient.signOut()}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              className="rounded border border-[color:var(--color-border)] px-2 py-1 text-xs hover:bg-[color:var(--color-surface-variant)]"
              href="/login"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
