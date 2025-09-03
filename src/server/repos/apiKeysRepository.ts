import { prisma } from '@/lib/prisma';

export const apiKeysRepository = {
  async findActiveByUser(userId: string, orgId?: string | null) {
    return prisma.userApiKey.findMany({
      where: orgId ? { orgId, isActive: true } : { userId, isActive: true },
      select: { id: true, provider: true, keyName: true, createdAt: true, updatedAt: true },
    });
  },
  async findAnyByUserAndProvider(userId: string, provider: string, orgId?: string | null) {
    return prisma.userApiKey.findFirst({
      where: orgId ? { orgId, provider } : { userId, provider },
    });
  },
  async update(id: string, data: { keyName?: string; encryptedKey?: string; isActive?: boolean }) {
    return prisma.userApiKey.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      select: { id: true, provider: true, keyName: true, createdAt: true, updatedAt: true },
    });
  },
  async create(
    userId: string,
    provider: string,
    keyName: string,
    encryptedKey: string,
    orgId?: string | null,
  ) {
    return prisma.userApiKey.create({
      data: { userId, provider, keyName, encryptedKey, orgId: orgId as string },
      select: { id: true, provider: true, keyName: true, createdAt: true, updatedAt: true },
    });
  },
  async deactivateByProvider(userId: string, provider: string, orgId?: string | null) {
    return prisma.userApiKey.updateMany({
      where: orgId ? { orgId, provider } : { userId, provider },
      data: { isActive: false },
    });
  },
};
