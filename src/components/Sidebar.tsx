'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import AppIcon from './AppIcon';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { Modal, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { useEffect, useRef, useState } from 'react';
import { ConfirmationModal } from './ui/ConfirmationModal';

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

      {/* User + Org controls */}
      <div className="3xl:p-10 4xl:p-12 border-t border-[color:var(--color-divider)] bg-[color:var(--color-surface-1)] p-4 lg:p-6 xl:p-7 2xl:p-8">
        {isPending ? (
          <div className="flex items-center gap-2 text-[color:var(--color-muted-foreground)]">
            <Spinner size="sm" />
            <span className="text-responsive-sm">Loading user...</span>
          </div>
        ) : session ? (
          <SidebarUserBlock
            name={session.user?.name ?? 'User'}
            email={session.user?.email ?? ''}
          />
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

function SidebarUserBlock({ name, email }: { name: string; email: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orgs, setOrgs] = useState<Array<{ id: string; name: string; role: 'ADMIN'|'EDITOR'|'VIEWER'; isActive: boolean }>>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [activeOrgName, setActiveOrgName] = useState<string>('');
  const [activeOrgRole, setActiveOrgRole] = useState<'ADMIN'|'EDITOR'|'VIEWER'|''>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const initial = (email?.[0] || name?.[0] || 'U').toUpperCase();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // Load orgs on mount to show current workspace in trigger
  useEffect(() => {
    (async () => {
      try {
        setLoadingOrgs(true);
        const res = await fetch('/api/orgs');
        if (!res.ok) return;
        const data = (await res.json()) as typeof orgs;
        setOrgs(data);
        const active = data.find((o) => o.isActive) || data[0];
        if (active) {
          setActiveOrgName(active.name);
          setActiveOrgRole(active.role);
        }
      } finally {
        setLoadingOrgs(false);
      }
    })();
  }, []);

  // Lazy refresh orgs when opening menu if none loaded
  useEffect(() => {
    if (!menuOpen || orgs.length) return;
    (async () => {
      try {
        setLoadingOrgs(true);
        const res = await fetch('/api/orgs');
        if (!res.ok) return;
        const data = (await res.json()) as typeof orgs;
        setOrgs(data);
      } finally {
        setLoadingOrgs(false);
      }
    })();
  }, [menuOpen, orgs.length]);

  const createOrg = async () => {
    if (!orgName.trim()) return;
    try {
      setCreating(true);
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: orgName.trim() }),
      });
      if (!res.ok) return;
      const org = await res.json();
      await fetch(`/api/orgs/${org.id}/switch`, { method: 'POST' });
      window.location.reload();
    } finally {
      setCreating(false);
    }
  };

  const switchOrg = async (id: string) => {
    await fetch(`/api/orgs/${id}/switch`, { method: 'POST' });
    window.location.reload();
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        className="group flex w-full items-center justify-between rounded-[var(--radius)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 transition-colors hover:bg-[color:var(--color-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/40"
        onClick={() => setMenuOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setMenuOpen((v) => !v);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-xs font-semibold text-[color:var(--color-surface)] shadow-[var(--shadow-sm)]">
            {initial}
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--color-foreground)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" />
                <path d="M3 12h18" />
                <path d="M12 3a15.3 15.3 0 0 1 4.5 9 15.3 15.3 0 0 1-4.5 9 15.3 15.3 0 0 1-4.5-9 15.3 15.3 0 0 1 4.5-9" />
              </svg>
              <span className="min-w-0 max-w-[11rem] truncate transition-colors group-hover:text-[color:var(--color-accent)]">
                {activeOrgName || 'Workspace'}
              </span>
              {activeOrgRole && (
                <span className="hidden rounded-full border border-[color:var(--color-border)] px-1.5 py-0.5 text-[10px] font-medium text-[color:var(--color-muted-foreground)] sm:inline">
                  {activeOrgRole.toLowerCase()}
                </span>
              )}
            </div>
            <div className="truncate text-xs text-[color:var(--color-muted-foreground)]">{email}</div>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {/* Menu */}
      {menuOpen && (
        <div className="absolute bottom-12 left-0 z-20 w-[min(20rem,calc(100vw-2rem))] origin-bottom-left rounded-[var(--radius-lg)] border border-[color:var(--color-divider)] bg-[color:var(--color-background)] p-2 shadow-[var(--shadow-lg)]">
          <div className="px-3 pb-2 pt-2 text-sm font-semibold text-[color:var(--color-foreground)]">Workspaces</div>
          <div className="max-h-64 overflow-y-auto">
            {loadingOrgs ? (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-[color:var(--color-muted-foreground)]">
                <Spinner size="sm" /> Loading…
              </div>
            ) : (
              orgs.map((o) => (
                <div
                  key={o.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => switchOrg(o.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      switchOrg(o.id);
                    }
                  }}
                  className={`group flex w-full items-center justify-between rounded-[var(--radius)] px-3 py-2 text-sm transition-colors hover:bg-[color:var(--color-surface)] ${o.isActive ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-foreground)]'}`}
                >
                  <span className="truncate">{o.name}</span>
                  <span className="ml-2 flex items-center gap-2">
                    {o.isActive ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="text-xs text-[color:var(--color-muted-foreground)]">{o.role.toLowerCase()}</span>
                    )}
                    {/* Inline actions on hover for any admin-owned workspace */}
                    {o.role === 'ADMIN' && (
                      <span className="ml-1 hidden items-center gap-1 opacity-0 transition-all duration-150 group-hover:flex group-hover:opacity-100">
                        <button
                          title="Rename workspace"
                          aria-label="Rename workspace"
                          className="h-5 w-5 rounded-[var(--radius)] text-[color:var(--color-foreground)] transition-all hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-accent)] active:scale-95"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedOrgId(o.id);
                            setRenameValue(o.name);
                            setRenameOpen(true);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <button
                          title="Delete workspace"
                          aria-label="Delete workspace"
                          className="h-5 w-5 rounded-[var(--radius)] text-[color:var(--color-danger)] transition-all hover:bg-[color:var(--color-danger)]/10 active:scale-95"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedOrgId(o.id);
                            setDeleteOpen(true);
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="my-2 h-px w-full bg-[color:var(--color-divider)]" />

          <button
            onClick={() => setModalOpen(true)}
            className="flex w-full items-center rounded-[var(--radius)] px-3 py-2 text-sm text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Create workspace
          </button>

          

          <div className="my-2 h-px w-full bg-[color:var(--color-divider)]" />

          <button
            onClick={() => authClient.signOut()}
            className="flex w-full items-center rounded-[var(--radius)] px-3 py-2 text-sm text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-surface)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Log out
          </button>
        </div>
      )}

      {/* Create Organization Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Workspace" size="sm">
        <ModalContent>
          <div className="p-6">
            <Input
              label="Name"
              placeholder="e.g. Design Team"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <div className="flex w-full items-center justify-end gap-2 p-4">
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={createOrg} loading={creating} disabled={!orgName.trim()}>
              Create
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Rename Workspace Modal */}
      <Modal isOpen={renameOpen} onClose={() => setRenameOpen(false)} title="Rename Workspace" size="sm">
        <ModalContent>
          <div className="p-6">
            <Input
              label="New name"
              placeholder="Workspace name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <div className="flex w-full items-center justify-end gap-2 p-4">
            <Button variant="secondary" size="sm" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={renaming}
              disabled={!renameValue.trim() || !selectedOrgId}
              onClick={async () => {
                if (!renameValue.trim() || !selectedOrgId) return;
                try {
                  setRenaming(true);
                  const res = await fetch(`/api/orgs/${selectedOrgId}`, {
                    method: 'PATCH',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ name: renameValue.trim() }),
                  });
                  if (res.ok) {
                    setOrgs((prev) => prev.map((o) => (o.id === selectedOrgId ? { ...o, name: renameValue.trim() } : o)));
                    const active = orgs.find((o) => o.isActive);
                    if (active && active.id === selectedOrgId) setActiveOrgName(renameValue.trim());
                    setRenameOpen(false);
                  }
                } finally {
                  setRenaming(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* Delete Workspace Confirmation */}
      <ConfirmationModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete workspace?"
        message="This permanently deletes the workspace and all its data. This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={async () => {
          if (!selectedOrgId) return;
          const res = await fetch(`/api/orgs/${selectedOrgId}`, { method: 'DELETE' });
          if (res.ok) {
            const data = await res.json();
            const wasActive = orgs.find((o) => o.id === selectedOrgId)?.isActive;
            setOrgs((prev) => prev.filter((o) => o.id !== selectedOrgId));
            setDeleteOpen(false);
            setMenuOpen(false);
            if (wasActive) {
              if (data?.nextOrgId) {
                await fetch(`/api/orgs/${data.nextOrgId}/switch`, { method: 'POST' });
              }
              window.location.reload();
            }
          }
        }}
      />
    </div>
  );
}
