import { apiKeysRepository } from '@/server/repos/apiKeysRepository';

export const apiKeysService = {
  async listActive(userId: string) {
    return apiKeysRepository.findActiveByUser(userId);
  },
  async upsertActive(userId: string, provider: string, keyName: string, encryptedKey: string) {
    const existing = await apiKeysRepository.findAnyByUserAndProvider(userId, provider);
    if (existing) {
      return apiKeysRepository.update(existing.id, { keyName, encryptedKey, isActive: true });
    }
    return apiKeysRepository.create(userId, provider, keyName, encryptedKey);
  },
  async deactivate(userId: string, provider: string) {
    await apiKeysRepository.deactivateByProvider(userId, provider);
  },
};
