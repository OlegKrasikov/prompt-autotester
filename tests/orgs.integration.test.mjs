import test from 'node:test';
import { CookieJar, request, signupAndLogin } from './utils/http.mjs';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

test.skip('Orgs: list/create/switch and members, invites (auto-accept)', async () => {
  const jarA = new CookieJar();
  const emailA = `admin_${Date.now()}@example.com`;
  const password = 'password123';
  await signupAndLogin(jarA, BASE_URL, { name: 'Admin', email: emailA, password });

  // List orgs (should include Personal org active)
  let res = await request(jarA, `${BASE_URL}/api/orgs`);
  if (!res.ok) throw new Error('GET /api/orgs failed');
  let orgs = await res.json();
  const active = orgs.find((o) => o.isActive) || orgs[0];
  if (!active) throw new Error('No active org');

  // Create new org
  res = await request(jarA, `${BASE_URL}/api/orgs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: `Test Org ${Date.now()}` }),
  });
  if (!res.ok) throw new Error('POST /api/orgs failed');
  const created = await res.json();

  // Switch to new org
  res = await request(jarA, `${BASE_URL}/api/orgs/${created.id}/switch`, { method: 'POST' });
  if (!res.ok) throw new Error('switch failed');

  // Invite user B
  const emailB = `invitee_${Date.now()}@example.com`;
  res = await request(jarA, `${BASE_URL}/api/orgs/${created.id}/members/invite`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: emailB, role: 'EDITOR' }),
  });
  if (!res.ok) throw new Error('invite failed');

  // User B signs up and logs in; should auto-accept invite
  const jarB = new CookieJar();
  await signupAndLogin(jarB, BASE_URL, { name: 'Editor', email: emailB, password });
  res = await request(jarB, `${BASE_URL}/api/orgs`);
  const orgsB = await res.json();
  if (!orgsB.some((o) => o.id === created.id)) throw new Error('invite not auto-accepted');
});
