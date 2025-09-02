export function can(ctx, action, resource) {
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
