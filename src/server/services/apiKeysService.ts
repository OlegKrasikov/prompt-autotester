import { apiKeysRepo } from "@/server/repos/apiKeysRepo";

export const apiKeysService = {
  async listActive(userId: string) {
    return apiKeysRepo.findActiveByUser(userId);
  },
  async upsertActive(userId: string, provider: string, keyName: string, encryptedKey: string) {
    const existing = await apiKeysRepo.findAnyByUserAndProvider(userId, provider);
    if (existing) {
      return apiKeysRepo.update(existing.id, { keyName, encryptedKey, isActive: true });
    }
    return apiKeysRepo.create(userId, provider, keyName, encryptedKey);
  },
  async deactivate(userId: string, provider: string) {
    await apiKeysRepo.deactivateByProvider(userId, provider);
  },
};

