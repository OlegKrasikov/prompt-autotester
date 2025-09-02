export type Flag =
  | 'org_shadow_mode'
  | 'enforce_org_context'
  | 'rbac_enforcement'
  | 'invite_flow_enabled';

const defaults: Record<Flag, boolean> = {
  org_shadow_mode: true,
  enforce_org_context: true,
  rbac_enforcement: true,
  invite_flow_enabled: true,
};

export function flag(name: Flag): boolean {
  const env = process.env[name.toUpperCase()];
  if (env === '1' || env === 'true') return true;
  if (env === '0' || env === 'false') return false;
  return defaults[name];
}

export const Flags = {
  shadow: () => flag('org_shadow_mode'),
  enforceOrg: () => flag('enforce_org_context'),
  rbac: () => flag('rbac_enforcement'),
  invites: () => flag('invite_flow_enabled'),
};
