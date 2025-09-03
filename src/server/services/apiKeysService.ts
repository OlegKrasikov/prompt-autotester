import { apiKeysRepository } from '@/server/repos/apiKeysRepository';
import type { OrgContext } from '@/server/auth/orgContext';

export const apiKeysService = {
  async listActive(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>) {
    return apiKeysRepository.findActiveByUser(ctx.userId, ctx.activeOrgId);
  },
  async upsertActive(
    ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>,
    provider: string,
    keyName: string,
    encryptedKey: string,
  ) {
    const existing = await apiKeysRepository.findAnyByUserAndProvider(
      ctx.userId,
      provider,
      ctx.activeOrgId,
    );
    if (existing) {
      return apiKeysRepository.update(existing.id, { keyName, encryptedKey, isActive: true });
    }
    return apiKeysRepository.create(
      ctx.userId,
      provider,
      keyName,
      encryptedKey,
      ctx.activeOrgId as string,
    );
  },
  async deactivate(ctx: Pick<OrgContext, 'userId' | 'activeOrgId'>, provider: string) {
    await apiKeysRepository.deactivateByProvider(ctx.userId, provider, ctx.activeOrgId);
  },
};
