'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import AppIcon from './AppIcon';
import { Button } from './ui/Button';
import { OrgSwitcher } from './OrgSwitcher';
import { Spinner } from './ui/Spinner';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Prompt Testing',
    href: '/testing',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
        <path d="M2 6h4" />
        <path d="M2 10h4" />
        <path d="M2 14h4" />
        <path d="M2 18h4" />
        <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
      </svg>
    ),
  },
  {
    name: 'Prompts',
    href: '/prompts',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Scenarios',
    href: '/scenarios',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 13a3 3 0 1 0-6 0" />
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        <circle cx="12" cy="8" r="2" />
      </svg>
    ),
  },
  {
    name: 'Variables',
    href: '/variables',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="3xl:w-96 4xl:w-[28rem] flex h-full w-56 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-sm)] lg:w-64 xl:w-72 2xl:w-80">
      {/* Logo and Title */}
      <div className="3xl:p-10 4xl:p-12 border-b border-[color:var(--color-divider)] p-4 lg:p-6 xl:p-7 2xl:p-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="transition-transform group-hover:scale-110">
            <AppIcon size={32} />
          </div>
          <div className="flex flex-col">
            <span className="text-responsive-base font-bold tracking-tight text-[color:var(--color-success)]">
              Prompt Autotester
            </span>
            <span className="text-responsive-sm font-medium text-[color:var(--color-muted-foreground)]">
              AI Testing Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="3xl:p-10 4xl:p-12 flex-1 p-4 lg:p-6 xl:p-7 2xl:p-8">
        <div className="3xl:mb-8 4xl:mb-10 mb-4 xl:mb-6 2xl:mb-7">
          <h2 className="text-responsive-sm 3xl:mb-6 4xl:mb-7 mb-3 font-semibold tracking-wider text-[color:var(--color-muted-foreground)] uppercase xl:mb-4 2xl:mb-5">
            Navigation
          </h2>
          <nav className="space-responsive-sm">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group 3xl:px-6 3xl:py-4 4xl:px-7 4xl:py-4 text-responsive-sm flex items-center justify-between rounded-[var(--radius)] px-3 py-2.5 font-medium transition-all duration-200 xl:px-4 xl:py-3 2xl:px-5 2xl:py-3.5 ${
                    isActive
                      ? 'bg-[color:var(--color-accent)]/10 text-[color:var(--color-accent)] shadow-[var(--shadow-sm)]'
                      : 'text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-1)] hover:text-[color:var(--color-accent)]'
                  } `}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center transition-transform ${isActive ? '' : 'group-hover:scale-110'}`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-[color:var(--color-warning)] px-2 py-0.5 text-xs font-medium text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Info, Org Switcher and Logout */}
      <div className="3xl:p-10 4xl:p-12 border-t border-[color:var(--color-divider)] bg-[color:var(--color-surface-1)] p-4 lg:p-6 xl:p-7 2xl:p-8">
        {isPending ? (
          <div className="flex items-center gap-2 text-[color:var(--color-muted-foreground)]">
            <Spinner size="sm" />
            <span className="text-responsive-sm">Loading user...</span>
          </div>
        ) : session ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-success)] text-sm font-semibold text-white">
                {(session.user?.email?.[0] || session.user?.name?.[0] || 'U').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[color:var(--color-foreground)]">
                  {session.user?.name ?? 'User'}
                </div>
                <div className="truncate text-xs text-[color:var(--color-muted-foreground)]">
                  {session.user?.email}
                </div>
              </div>
            </div>
            {/* Org switcher + new org */}
            <div className="space-y-2">
              <OrgSwitcher />
              <button
                className="w-full rounded border border-[color:var(--color-border)] px-2 py-1 text-xs hover:bg-[color:var(--color-surface-variant)]"
                onClick={async () => {
                  const name = window.prompt('Organization name');
                  if (!name) return;
                  try {
                    const res = await fetch('/api/orgs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
                    if (!res.ok) return alert('Failed to create organization');
                    const org = await res.json();
                    await fetch(`/api/orgs/${org.id}/switch`, { method: 'POST' });
                    window.location.reload();
                  } catch {
                    alert('Failed to create organization');
                  }
                }}
              >
                + New Organization
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => authClient.signOut()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => (window.location.href = '/login')}
          >
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
}
