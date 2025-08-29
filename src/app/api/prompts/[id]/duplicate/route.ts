import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { okJson, unauthorized, notFound, serverError } from '@/server/http/responses';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const resolvedParams = params;
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    // Check if prompt exists and belongs to user
    const existingPrompt = await prisma.prompt.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
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
        where: {
          name: duplicateName,
          userId: user.id,
        },
      });

      if (!conflictingPrompt) {
        break;
      }

      counter++;
      duplicateName = `${existingPrompt.name} (Copy ${counter})`;
    }

    const duplicatedPrompt = await prisma.prompt.create({
      data: {
        userId: user.id,
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
