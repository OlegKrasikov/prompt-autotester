import test from 'node:test';
import assert from 'node:assert/strict';
import { can } from './helpers/rbac.js';

const mkCtx = (role) => ({
  userId: 'u',
  activeOrgId: 'o',
  role,
  isAdmin: role === 'ADMIN',
  isEditor: role !== 'VIEWER',
  isViewer: true,
});

test('RBAC: Admin can manage settings and members', () => {
  const ctx = mkCtx('ADMIN');
  assert.equal(can(ctx, 'settings', 'settings'), true);
  assert.equal(can(ctx, 'manage', 'members'), true);
  assert.equal(can(ctx, 'write', 'scenarios'), true);
  assert.equal(can(ctx, 'read', 'prompts'), true);
});

test('RBAC: Editor cannot access settings or manage members', () => {
  const ctx = mkCtx('EDITOR');
  assert.equal(can(ctx, 'settings', 'settings'), false);
  assert.equal(can(ctx, 'manage', 'members'), false);
  assert.equal(can(ctx, 'write', 'scenarios'), true);
  assert.equal(can(ctx, 'read', 'prompts'), true);
});

test('RBAC: Viewer is read-only', () => {
  const ctx = mkCtx('VIEWER');
  assert.equal(can(ctx, 'read', 'scenarios'), true);
  assert.equal(can(ctx, 'write', 'scenarios'), false);
  assert.equal(can(ctx, 'manage', 'members'), false);
});
