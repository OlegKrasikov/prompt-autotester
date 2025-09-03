import { NextResponse } from 'next/server';

export function setOrgCookies(res: NextResponse, orgId: string, role: string) {
  res.cookies.set('pa_active_org_id', orgId, { path: '/', httpOnly: false });
  res.cookies.set('pa_org_role', role, { path: '/', httpOnly: false });
  return res;
}
