import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { requireOrgContext } from '@/server/auth/orgContext';
import { okJson, notFound, serverError } from '@/server/http/responses';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: any) {
  const resolvedParams = params;
  try {
    const ctx = await requireOrgContext(request);

    // Check if prompt exists and belongs to user
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        id: resolvedParams.id,
        ...(ctx.activeOrgId ? { orgId: ctx.activeOrgId } : { userId: ctx.userId }),
      },
    });

    if (!existingPrompt) {
      return notFound('Prompt not found');
    }

    // Generate a unique name for the duplicate
    let duplicateName = `${existingPrompt.name} (Copy)`;
    let counter = 1;

    // Check for name conflicts and append a number if needed
    while (true) {
      const conflictingPrompt = await prisma.prompt.findFirst({
        where: ctx.activeOrgId
          ? { name: duplicateName, orgId: ctx.activeOrgId }
          : { name: duplicateName, userId: ctx.userId },
      });

      if (!conflictingPrompt) {
        break;
      }

      counter++;
      duplicateName = `${existingPrompt.name} (Copy ${counter})`;
    }

    const duplicatedPrompt = await prisma.prompt.create({
      data: {
        userId: ctx.userId,
        orgId: ctx.activeOrgId as string,
        name: duplicateName,
        description: existingPrompt.description,
        content: existingPrompt.content,
        status: 'DRAFT', // Always create duplicates as drafts
        tags: existingPrompt.tags,
      },
    });

    return okJson(serializeBigInt(duplicatedPrompt));
  } catch (error) {
    console.error('Error duplicating prompt:', error);
    return serverError('Failed to duplicate prompt');
  }
}
