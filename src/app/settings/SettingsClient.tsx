'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useModal } from '@/hooks/useModal';
import { Spinner } from '@/components/ui/Spinner';

interface ApiKey {
  id: string;
  provider: string;
  keyName: string;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsClient({ orgRole }: { orgRole: 'ADMIN' | 'EDITOR' | 'VIEWER' }) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [openaiKey, setOpenaiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState('');
  const [aiConfigOpen, setAiConfigOpen] = useState<boolean>(true);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const confirmModal = useModal();

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setApiLoading(false);
    }
  };

  const proceedWithSaving = async () => {
    setSaving(true);
    setMessage('💾 Saving API key...');

    try {
      const saveResponse = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'openai',
          keyName: 'OpenAI API Key',
          apiKey: openaiKey,
        }),
      });

      const saveData = await saveResponse.json();

      if (saveResponse.ok) {
        setMessage('✅ OpenAI API key validated and saved successfully!');
        setOpenaiKey('');
        fetchApiKeys();
      } else {
        const errorMessage = saveData.userMessage || saveData.error || 'Error saving API key';
        setMessage(errorMessage);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      setMessage('Network error. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const validateAndSaveOpenAIKey = async () => {
    if (!openaiKey.trim()) {
      setMessage('Please enter an API key');
      return;
    }
    setValidating(true);
    setMessage('🔍 Validating API key...');

    try {
      const validateResponse = await fetch('/api/user/api-keys/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openai', apiKey: openaiKey }),
      });
      const validateData = await validateResponse.json();
      if (!validateResponse.ok || validateData.valid === false) {
        setMessage(validateData.userMessage || 'API key validation failed');
        setValidating(false);
        return;
      }
      if (validateData.valid === null) {
        setConfirmMessage(`${validateData.userMessage}\n\nWould you like to save the key anyway?`);
        setConfirmAction(() => proceedWithSaving);
        confirmModal.open();
        setValidating(false);
        return;
      }
      setValidating(false);
      await proceedWithSaving();
    } catch {
      console.error('Error validating API key');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const hasOpenAIKey = apiKeys.some((k) => k.provider === 'openai');
  const isAdmin = orgRole === 'ADMIN';
  const deleteApiKey = async (provider: string) => {
    try {
      const response = await fetch(`/api/user/api-keys?provider=${provider}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage('API key deleted successfully');
        fetchApiKeys();
      } else {
        setMessage('Error deleting API key');
      }
    } catch {
      setMessage('Error deleting API key');
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 sm:px-8 md:px-10">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-[color:var(--color-foreground)]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--color-accent)] text-[color:var(--color-surface)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v18" />
                <path d="M3 12h18" />
              </svg>
            </div>
            Settings
          </div>
        </h1>
        <p className="text-[color:var(--color-muted-foreground)]">
          Manage your account settings and API configurations
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader
          className="cursor-pointer transition-colors duration-200 hover:bg-[color:var(--color-surface)]/50"
          onClick={() => setAiConfigOpen(!aiConfigOpen)}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
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
              AI Model Configuration
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
              className={`transition-transform duration-200 ${aiConfigOpen ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </CardTitle>
        </CardHeader>
        {aiConfigOpen && (
          <CardContent>
            {apiLoading ? (
              <div className="flex items-center gap-3 py-4 text-[color:var(--color-muted-foreground)]">
                <Spinner size="sm" />
                <span className="text-sm">Loading configuration…</span>
              </div>
            ) : (
              <>
            {!isAdmin && (
              <div className="mb-4 rounded border border-[color:var(--color-warning)]/30 bg-[color:var(--color-warning)]/10 p-3 text-xs text-[color:var(--color-warning)]">
                You have {orgRole.toLowerCase()} access. Settings are read-only.
              </div>
            )}
            <p className="mb-6 text-sm text-[color:var(--color-muted-foreground)]">
              Configure API keys for AI models used in prompt testing. Keys are encrypted and stored
              securely.
            </p>
            <div className="space-y-4">
              <Card variant="outlined">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium text-[color:var(--color-foreground)]">
                        OpenAI API Key
                      </h3>
                      <p className="text-xs text-[color:var(--color-muted-foreground)]">
                        Required for GPT models (GPT-4, GPT-3.5, etc.)
                      </p>
                    </div>
                    {hasOpenAIKey && (
                      <span className="rounded-full border border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/10 px-2 py-1 text-xs text-[color:var(--color-success)]">
                        Configured
                      </span>
                    )}
                  </div>

                  {hasOpenAIKey ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[color:var(--color-muted-foreground)]">
                        API key is configured and encrypted
                      </span>
                      {isAdmin && (
                        <Button variant="danger" size="sm" onClick={() => deleteApiKey('openai')}>
                          Remove
                        </Button>
                      )}
                    </div>
                  ) : (
                    isAdmin ? (
                      <div className="space-y-3">
                        <Input type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." label="" />
                        <Button variant="primary" onClick={validateAndSaveOpenAIKey} disabled={saving || validating} loading={saving || validating}>
                          {validating ? 'Validating...' : saving ? 'Saving...' : 'Validate & Save API Key'}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-[color:var(--color-muted-foreground)]">No API key configured</span>
                    )
                  )}
                </CardContent>
              </Card>

              {message && (
                <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-sm text-[color:var(--color-muted-foreground)]">
                  {message}
                </div>
              )}
            </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Organization Members & Invites inline section */}
      <OrganizationMembersSection readOnly={!isAdmin} />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        title="Save API key?"
        message={confirmMessage}
        onConfirm={async () => {
          if (confirmAction) await confirmAction();
          confirmModal.close();
        }}
      />
    </div>
  );
}

function OrganizationMembersSection({ readOnly }: { readOnly: boolean }) {
  const [members, setMembers] = useState<Array<{ userId: string; name: string; email: string; role: 'ADMIN'|'EDITOR'|'VIEWER'; status: 'ACTIVE'|'INVITED'|'REMOVED' }>>([]);
  const [invites, setInvites] = useState<Array<{ id: string; email: string; role: 'ADMIN'|'EDITOR'|'VIEWER'; expiresAt: string; status: string }>>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN'|'EDITOR'|'VIEWER'>('VIEWER');
  const [updatingRoleIds, setUpdatingRoleIds] = useState<Set<string>>(new Set());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const orgsRes = await fetch('/api/orgs');
        if (!orgsRes.ok) return setOrgLoading(false);
        const orgs = (await orgsRes.json()) as Array<{ id: string; isActive: boolean; role: string }>;
        const active = orgs.find((o) => o.isActive) || orgs[0];
        if (!active) return setOrgLoading(false);
        setActiveOrgId(active.id);
        setOrgLoading(false);
        // fetch members + invites concurrently
        setMembersLoading(true);
        setInvitesLoading(true);
        const [mRes, iRes] = await Promise.allSettled([
          fetch(`/api/orgs/${active.id}/members`).then((r) => (r.ok ? r.json() : [])),
          fetch(`/api/orgs/${active.id}/invitations`).then((r) => (r.ok ? r.json() : [])),
        ]);
        if (mRes.status === 'fulfilled') setMembers(mRes.value as any);
        if (iRes.status === 'fulfilled') setInvites(iRes.value as any);
      } finally {
        setMembersLoading(false);
        setInvitesLoading(false);
      }
    })();
  }, []);

  if (!activeOrgId) {
    return (
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Organization Members & Invites</CardTitle>
        </CardHeader>
        <CardContent>
          {orgLoading ? (
            <div className="flex items-center gap-3 py-4 text-[color:var(--color-muted-foreground)]">
              <Spinner size="sm" />
              <span className="text-sm">Loading organization…</span>
            </div>
          ) : (
            <div className="text-sm text-[color:var(--color-muted-foreground)]">No active organization</div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            {/* Organization icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[color:var(--color-foreground)]"
            >
              {/* Building + users hybrid icon */}
              <rect x="3" y="3" width="8" height="12" rx="1" />
              <path d="M7 7h2M7 10h2M7 13h2" />
              <path d="M14 14a3 3 0 1 1 6 0" />
              <circle cx="17" cy="10" r="2" />
              <path d="M2 21h20" />
            </svg>
            Organization Members & Invites
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {feedback && (
          <div
            className={`mb-3 rounded border p-2 text-xs ${
              feedback.type === 'success'
                ? 'border-[color:var(--color-success)]/30 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]'
                : 'border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]'
            }`}
          >
            {feedback.message}
          </div>
        )}
        {membersLoading && invitesLoading ? (
          <div className="flex items-center gap-3 py-4 text-[color:var(--color-muted-foreground)]">
            <Spinner size="sm" />
            <span className="text-sm">Loading organization…</span>
          </div>
        ) : (
          <>
        {!readOnly && (
          <div className="mb-3 text-right">
            <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
              Invite Member
            </Button>
          </div>
        )}
        <div className="grid grid-cols-12 gap-3 border-b border-[color:var(--color-border)] pb-2 text-xs uppercase text-[color:var(--color-muted-foreground)]">
          <div className="col-span-5">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-1">Actions</div>
        </div>
        {membersLoading ? (
          <div className="flex items-center gap-3 py-4 text-[color:var(--color-muted-foreground)]">
            <Spinner size="sm" />
            <span className="text-sm">Loading members…</span>
          </div>
        ) : members.map((m) => (
          <div key={m.userId} className="grid grid-cols-12 items-center gap-3 border-b border-[color:var(--color-border)] py-2 text-sm">
            <div className="col-span-5">{m.name || '—'}</div>
            <div className="col-span-4">{m.email}</div>
            <div className="col-span-2">
              {readOnly ? (
                <span className="text-[color:var(--color-muted-foreground)]">{m.role.toLowerCase()}</span>
              ) : (
                <select
                  className="rounded border border-[color:var(--color-border)] px-2 py-1 text-xs disabled:opacity-60"
                  value={m.role}
                  disabled={updatingRoleIds.has(m.userId)}
                  onChange={async (e) => {
                    const nextRole = e.target.value as 'ADMIN' | 'EDITOR' | 'VIEWER';
                    // optimistic UI with loading state per row
                    setUpdatingRoleIds((prev) => new Set(prev).add(m.userId));
                    try {
                      const res = await fetch(`/api/orgs/${activeOrgId}/members/${m.userId}`, {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ role: nextRole }),
                      });
                      if (res.ok) {
                        setMembers((prev) => prev.map((x) => (x.userId === m.userId ? { ...x, role: nextRole } : x)));
                        setFeedback({ type: 'success', message: 'Member role updated' });
                      } else {
                        // revert UI and show error
                        setFeedback({ type: 'error', message: 'Failed to update role' });
                      }
                    } catch {
                      setFeedback({ type: 'error', message: 'Failed to update role' });
                    } finally {
                      setUpdatingRoleIds((prev) => {
                        const next = new Set(prev);
                        next.delete(m.userId);
                        return next;
                      });
                      // auto-dismiss feedback after a short delay
                      setTimeout(() => setFeedback(null), 2500);
                    }
                  }}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              )}
            </div>
            <div className="col-span-1 text-right">
              {!readOnly && (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={removingIds.has(m.userId)}
                  onClick={async () => {
                    setRemovingIds((prev) => new Set(prev).add(m.userId));
                    try {
                      const res = await fetch(`/api/orgs/${activeOrgId}/members/${m.userId}`, { method: 'DELETE' });
                      if (res.ok) {
                        setMembers((prev) => prev.filter((x) => x.userId !== m.userId));
                        setFeedback({ type: 'success', message: 'Member removed' });
                      } else {
                        setFeedback({ type: 'error', message: 'Failed to remove member' });
                      }
                    } catch {
                      setFeedback({ type: 'error', message: 'Failed to remove member' });
                    } finally {
                      setRemovingIds((prev) => {
                        const next = new Set(prev);
                        next.delete(m.userId);
                        return next;
                      });
                      setTimeout(() => setFeedback(null), 2500);
                    }
                  }}
                >
                  {removingIds.has(m.userId) ? 'Removing…' : 'Remove'}
                </Button>
              )}
            </div>
          </div>
        ))}

        {(invitesLoading || invites.length > 0) && (
          <div className="mt-6">
            <div className="mb-2 text-xs uppercase text-[color:var(--color-muted-foreground)]">Pending Invites</div>
            <div className="grid grid-cols-12 gap-3 border-b border-[color:var(--color-border)] pb-2 text-xs uppercase text-[color:var(--color-muted-foreground)]">
              <div className="col-span-6">Email</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2">Expires</div>
              <div className="col-span-1">Actions</div>
            </div>
            {invitesLoading ? (
              <div className="flex items-center gap-3 py-4 text-[color:var(--color-muted-foreground)]">
                <Spinner size="sm" />
                <span className="text-sm">Loading invites…</span>
              </div>
            ) : invites.map((iv) => (
              <div key={iv.id} className="grid grid-cols-12 items-center gap-3 border-b border-[color:var(--color-border)] py-2 text-sm">
                <div className="col-span-6">{iv.email}</div>
                <div className="col-span-3">{iv.role.toLowerCase()}</div>
                <div className="col-span-2">{new Date(iv.expiresAt).toLocaleDateString()}</div>
                <div className="col-span-1 text-right">
                  {!readOnly && (
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={async () => { await fetch(`/api/orgs/${activeOrgId}/invitations/${iv.id}/resend`, { method: 'POST' }); }}>
                        Resend
                      </Button>
                      <Button variant="danger" size="sm" onClick={async () => { await fetch(`/api/orgs/${activeOrgId}/invitations/${iv.id}`, { method: 'DELETE' }); setInvites((prev) => prev.filter((x) => x.id !== iv.id)); }}>
                        Revoke
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
          </>
        )}
      </CardContent>
    </Card>

    {/* Invite Modal per design system */}
    {!readOnly && (
      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Member" size="sm">
        <ModalContent>
          <div className="space-y-4">
            <Input label="Email" placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Select label="Role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as any)}>
              <option value="ADMIN">Admin</option>
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </Select>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setInviteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              if (!inviteEmail || !activeOrgId) return;
              const res = await fetch(`/api/orgs/${activeOrgId}/members/invite`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
              });
              if (res.ok) {
                const data = await res.json();
                setInvites((prev) => [
                  { id: data.id, email: inviteEmail, role: inviteRole, expiresAt: data.expiresAt, status: 'PENDING' },
                  ...prev,
                ]);
                setInviteEmail('');
                setInviteRole('VIEWER');
                setInviteOpen(false);
              }
            }}
          >
            Send Invite
          </Button>
        </ModalFooter>
      </Modal>
    )}
    </>
  );
}
