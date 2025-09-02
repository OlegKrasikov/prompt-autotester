import type { OrgContext } from './orgContext';

export type Action = 'read' | 'write' | 'manage' | 'settings';
export type Resource = 'scenarios' | 'prompts' | 'variables' | 'members' | 'settings' | 'orgs';

export function can(ctx: OrgContext, action: Action, resource: Resource): boolean {
  if (!ctx.role) return false;
  if (ctx.role === 'ADMIN') return true;
  if (ctx.role === 'EDITOR') {
    if (resource === 'settings' || action === 'settings') return false;
    if (resource === 'members' || action === 'manage') return false;
    return true; // read/write everything else
  }
  // VIEWER
  if (action === 'read') return true;
  return false;
}
