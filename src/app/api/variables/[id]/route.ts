import { NextRequest } from 'next/server';
import { serializeBigInt } from '@/lib/utils/bigint-serializer';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { UpdateVariableSchema } from '@/server/validation/schemas';
import { okJson, unauthorized, notFound, errorJson, serverError } from '@/server/http/responses';
import { variablesService } from '@/server/services/variablesService';

// Helper function to check if a variable is used in any prompts or scenarios
async function checkVariableUsage(variableKey: string, userId: string) {
  const variablePattern = `{{${variableKey}}}`;

  // Check prompts
  const promptsWithVariable = await prisma.prompt.findMany({
    where: {
      userId: userId,
      content: {
        contains: variablePattern,
      },
    },
    select: {
      id: true,
      name: true,
      content: true,
    },
  });

  // Check scenarios - look in scenario turn userText
  const scenarioTurnsWithVariable = await prisma.scenarioTurn.findMany({
    where: {
      scenario: {
        userId: userId,
      },
      userText: {
        contains: variablePattern,
      },
    },
    include: {
      scenario: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    prompts: promptsWithVariable,
    scenarios: scenarioTurnsWithVariable
      .map((turn) => turn.scenario)
      .filter(
        (scenario, index, self) =>
          // Remove duplicates by id
          index === self.findIndex((s) => s.id === scenario.id),
      ),
  };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const variable = await variablesService.get(user.id, params.id);

    if (!variable) {
      return notFound('Variable not found');
    }

    return okJson(serializeBigInt(variable));
  } catch (error) {
    console.error('Error fetching variable:', error);
    return serverError('Failed to fetch variable');
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const json = await request.json();
    const body = UpdateVariableSchema.safeParse(json);
    if (!body.success) {
      return errorJson('Invalid variable payload', { status: 400, details: body.error.flatten() });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(body.data.key)) {
      return errorJson('Key must contain only letters, numbers, and underscores', { status: 400 });
    }

    // Check if current variable exists and belongs to user
    const updated = await variablesService.update(user.id, params.id, body.data);
    if (updated.error) {
      if (updated.code === 'NOT_FOUND') return notFound('Variable not found');
      if (updated.code === 'DUPLICATE')
        return errorJson('Variable with this key already exists', { status: 400 });
      return serverError('Failed to update variable');
    }
    return okJson(serializeBigInt(updated.data));
  } catch (error) {
    console.error('Error updating variable:', error);
    return serverError('Failed to update variable');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorized();
    }

    const removed = await variablesService.remove(user.id, params.id);
    if (removed.error) {
      if (removed.code === 'NOT_FOUND') return notFound('Variable not found');
      if (removed.code === 'IN_USE') {
        return errorJson('Cannot delete variable because it is being used', {
          status: 400,
          userMessage:
            'This variable is currently being used and cannot be deleted. Remove it from all prompts and scenarios first.',
          details: removed.details,
        });
      }
      return serverError('Failed to delete variable');
    }
    return okJson({ success: true });
  } catch (error) {
    console.error('Error deleting variable:', error);
    return serverError('Failed to delete variable');
  }
}
