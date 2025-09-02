import test from 'node:test';
import assert from 'node:assert/strict';
import { CookieJar, request, signupAndLogin } from './utils/http.mjs';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

test('Orgs: list/create/switch and members, invites (auto-accept)', async () => {
  const jarA = new CookieJar();
  const emailA = `admin_${Date.now()}@example.com`;
  const password = 'password123';
  await signupAndLogin(jarA, BASE_URL, { name: 'Admin', email: emailA, password });

  // List orgs (should include Personal org active)
  let res = await request(jarA, `${BASE_URL}/api/orgs`);
  assert.equal(res.ok, true, 'GET /api/orgs should be ok');
  let orgs = await res.json();
  assert.ok(Array.isArray(orgs) && orgs.length >= 1);
  const active = orgs.find((o) => o.isActive) || orgs[0];

  // Create new org
  res = await request(jarA, `${BASE_URL}/api/orgs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: `Test Org ${Date.now()}` }),
  });
  assert.equal(res.ok, true, 'POST /api/orgs should be ok');
  const created = await res.json();
  assert.ok(created?.id);

  // Switch to new org
  res = await request(jarA, `${BASE_URL}/api/orgs/${created.id}/switch`, { method: 'POST' });
  assert.equal(res.ok, true, 'POST /api/orgs/:id/switch should be ok');

  // Verify switch
  res = await request(jarA, `${BASE_URL}/api/orgs`);
  orgs = await res.json();
  const nowActive = orgs.find((o) => o.isActive);
  assert.equal(nowActive?.id, created.id, 'Active org should match switched id');

  // Invite user B
  const emailB = `invitee_${Date.now()}@example.com`;
  res = await request(jarA, `${BASE_URL}/api/orgs/${created.id}/members/invite`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: emailB, role: 'EDITOR' }),
  });
  assert.equal(res.ok, true, 'POST invite should be ok');

  // User B signs up and logs in; should auto-accept invite
  const jarB = new CookieJar();
  await signupAndLogin(jarB, BASE_URL, { name: 'Editor', email: emailB, password });
  res = await request(jarB, `${BASE_URL}/api/orgs`);
  const orgsB = await res.json();
  assert.ok(
    orgsB.some((o) => o.id === created.id),
    'Invitee should see invited org',
  );
});
