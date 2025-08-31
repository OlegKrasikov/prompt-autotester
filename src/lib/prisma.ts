import { PrismaClient } from '@prisma/client';

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

const prismaClient: PrismaClient = global.cachedPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.cachedPrisma = prismaClient;
}

export const prisma = prismaClient;
export default prismaClient;
