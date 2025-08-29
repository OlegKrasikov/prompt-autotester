import { prisma } from "@/lib/prisma";

export const apiKeysRepo = {
  async findActiveByUser(userId: string) {
    return prisma.userApiKey.findMany({
      where: { userId, isActive: true },
      select: { id: true, provider: true, keyName: true, createdAt: true, updatedAt: true },
    });
  },
  async findAnyByUserAndProvider(userId: string, provider: string) {
    return prisma.userApiKey.findFirst({ where: { userId, provider } });
  },
  async update(id: string, data: { keyName?: string; encryptedKey?: string; isActive?: boolean }) {
    return prisma.userApiKey.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      select: { id: true, provider: true, keyName: true, createdAt: true, updatedAt: true },
    });
  },
  async create(userId: string, provider: string, keyName: string, encryptedKey: string) {
    return prisma.userApiKey.create({
      data: { userId, provider, keyName, encryptedKey },
      select: { id: true, provider: true, keyName: true, createdAt: true, updatedAt: true },
    });
  },
  async deactivateByProvider(userId: string, provider: string) {
    return prisma.userApiKey.updateMany({ where: { userId, provider }, data: { isActive: false } });
  },
};

