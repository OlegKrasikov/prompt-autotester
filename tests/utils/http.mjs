import assert from 'node:assert/strict';

export class CookieJar {
  constructor() {
    this.cookies = new Map();
  }
  storeFrom(response) {
    const set = response.headers.getSetCookie?.() || response.headers.raw?.()['set-cookie'] || [];
    for (const line of set) {
      const [pair] = line.split(';');
      const [name, ...rest] = pair.split('=');
      const value = rest.join('=');
      this.cookies.set(name.trim(), value);
    }
  }
  header() {
    if (this.cookies.size === 0) return undefined;
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }
}

export async function request(jar, url, init = {}) {
  const headers = new Headers(init.headers || {});
  const cookieHeader = jar.header();
  if (cookieHeader) headers.set('cookie', cookieHeader);
  const res = await fetch(url, { ...init, headers });
  jar.storeFrom(res);
  return res;
}

export async function signupAndLogin(jar, baseUrl, { name, email, password }) {
  // Sign up
  let res = await request(jar, `${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`Signup failed: ${res.status} ${text}`);
  }

  // Login
  res = await request(jar, `${baseUrl}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} ${text}`);
  }
}
