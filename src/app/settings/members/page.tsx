'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Modal, ModalContent, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

type Member = {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR' | 'VIEWER';
  status: 'ACTIVE' | 'INVITED' | 'REMOVED';
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Member['role']>('VIEWER');
  const [invites, setInvites] = useState<
    Array<{ id: string; email: string; role: Member['role']; expiresAt: string; status: string }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const orgsRes = await fetch('/api/orgs');
        if (!orgsRes.ok) return;
        const orgs = (await orgsRes.json()) as Array<{
          id: string;
          isActive: boolean;
          role: string;
        }>;
        const active = orgs.find((o) => o.isActive) || orgs[0];
        if (!active) return;
        setActiveOrgId(active.id);
        setIsAdmin(active.role === 'ADMIN');
        const res = await fetch(`/api/orgs/${active.id}/members`);
        if (!res.ok) return;
        const data = (await res.json()) as Member[];
        setMembers(data);
        const invRes = await fetch(`/api/orgs/${active.id}/invitations`);
        if (invRes.ok) setInvites(await invRes.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateRole = async (userId: string, role: Member['role']) => {
    if (!activeOrgId) return;
    await fetch(`/api/orgs/${activeOrgId}/members/${userId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, role } : m)));
  };

  const removeMember = async (userId: string) => {
    if (!activeOrgId) return;
    await fetch(`/api/orgs/${activeOrgId}/members/${userId}`, { method: 'DELETE' });
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  if (loading)
    return (
      <div className="p-6 text-sm text-[color:var(--color-muted-foreground)]">Loading members…</div>
    );
  if (!activeOrgId)
    return (
      <div className="p-6 text-sm text-[color:var(--color-muted-foreground)]">
        No active organization.
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Card variant="elevated">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Members</CardTitle>
          {isAdmin && (
            <Button variant="primary" onClick={() => setInviteOpen(true)}>
              Invite Member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-3 border-b border-[color:var(--color-border)] pb-2 text-xs text-[color:var(--color-muted-foreground)] uppercase">
            <div className="col-span-5">Name</div>
            <div className="col-span-4">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-1">Actions</div>
          </div>
          {members.map((m) => (
            <div
              key={m.userId}
              className="grid grid-cols-12 items-center gap-3 border-b border-[color:var(--color-border)] py-2 text-sm"
            >
              <div className="col-span-5">{m.name || '—'}</div>
              <div className="col-span-4">{m.email}</div>
              <div className="col-span-2">
                {isAdmin ? (
                  <Select
                    value={m.role}
                    onChange={(e) => updateRole(m.userId, e.target.value as Member['role'])}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </Select>
                ) : (
                  <span className="text-[color:var(--color-muted-foreground)]">
                    {m.role.toLowerCase()}
                  </span>
                )}
              </div>
              <div className="col-span-1 text-right">
                {isAdmin && (
                  <Button variant="danger" size="sm" onClick={() => removeMember(m.userId)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-xs text-[color:var(--color-muted-foreground)] uppercase">
                Pending Invites
              </div>
              <div className="grid grid-cols-12 gap-3 border-b border-[color:var(--color-border)] pb-2 text-xs text-[color:var(--color-muted-foreground)] uppercase">
                <div className="col-span-6">Email</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-2">Expires</div>
                <div className="col-span-1">Actions</div>
              </div>
              {invites.map((iv) => (
                <div
                  key={iv.id}
                  className="grid grid-cols-12 items-center gap-3 border-b border-[color:var(--color-border)] py-2 text-sm"
                >
                  <div className="col-span-6">{iv.email}</div>
                  <div className="col-span-3">{iv.role.toLowerCase()}</div>
                  <div className="col-span-2">{new Date(iv.expiresAt).toLocaleDateString()}</div>
                  <div className="col-span-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => {
                          await fetch(`/api/orgs/${activeOrgId}/invitations/${iv.id}/resend`, {
                            method: 'POST',
                          });
                        }}
                      >
                        Resend
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={async () => {
                          await fetch(`/api/orgs/${activeOrgId}/invitations/${iv.id}`, {
                            method: 'DELETE',
                          });
                          setInvites((prev) => prev.filter((x) => x.id !== iv.id));
                        }}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Member"
        size="sm"
      >
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
            />
            <Select
              label="Role"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Member['role'])}
            >
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
              if (!activeOrgId || !inviteEmail) return;
              const res = await fetch(`/api/orgs/${activeOrgId}/members/invite`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
              });
              if (res.ok) {
                const newInvite = await res.json();
                // Push optimistic row (minimal info)
                setInvites((prev) => [
                  {
                    id: newInvite.id,
                    email: inviteEmail,
                    role: inviteRole,
                    expiresAt: newInvite.expiresAt,
                    status: 'PENDING',
                  },
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
    </div>
  );
}
