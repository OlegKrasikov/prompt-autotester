import { NextRequest, NextResponse } from 'next/server';
import { getScenarioByKey } from '@/lib/scenarios';
import { prisma } from '@/lib/prisma';
import { decrypt, ensureCryptoReady } from '@/server/utils/crypto';
import { getCurrentUser } from '@/lib/utils/auth-utils';
import { SimulateRequestSchema } from '@/server/validation/schemas';
import { errorJson } from '@/server/http/responses';
import { getLogger } from '@/server/logging/logger';
import { chatCompletion, createOpenAIClient } from '@/server/openai/client';
import { Conversation, ModelConfig, ChatMessage } from '@/lib/types';
import type { ScenarioTurnType } from '@/lib/constants/enums';

// Using centralized crypto helper for decryption

// Get user's OpenAI API key
async function getUserApiKey(userId: string): Promise<string | null> {
  try {
    const apiKey = await prisma.userApiKey.findFirst({
      where: {
        userId,
        provider: 'openai',
        isActive: true,
      },
      select: {
        encryptedKey: true,
      },
    });

    if (!apiKey?.encryptedKey) {
      return null;
    }

    // Decrypt using the primary application encryption key only
    try {
      const primary = decrypt(apiKey.encryptedKey);
      return primary;
    } catch {
      getLogger().error('Failed to decrypt API key with ENCRYPTION_KEY');
      return null;
    }
  } catch (error) {
    getLogger().error('Failed to get API key', { error: String(error) });
    return null;
  }
}

// Fetch scenario from database
async function getScenarioById(scenarioId: string, userId: string) {
  try {
    const scenario = await prisma.scenario.findFirst({
      where: {
        id: scenarioId,
        userId,
        status: 'PUBLISHED',
      },
      include: {
        turns: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return scenario;
  } catch (error) {
    getLogger().error('Failed to fetch scenario', { error: String(error) });
    return null;
  }
}

// Get user's variables and resolve them in text
async function resolveVariables(text: string, userId: string): Promise<string> {
  try {
    const variables = await prisma.variable.findMany({
      where: {
        userId,
      },
    });

    let resolvedText = text;

    // Replace each {{key}} with its corresponding value
    for (const variable of variables) {
      const pattern = new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g');
      resolvedText = resolvedText.replace(pattern, variable.value);
    }

    return resolvedText;
  } catch (error) {
    getLogger().error('Failed to resolve variables', { error: String(error) });
    return text; // Return original text if variable resolution fails
  }
}

interface ScenarioTurn {
  orderIndex: number;
  turnType: ScenarioTurnType;
  userText?: string;
}

// Stream OpenAI conversation simulation
async function* streamSimulation(
  systemPrompt: string,
  scenarioTurns: ScenarioTurn[],
  modelConfig: ModelConfig,
  apiKey: string,
  promptType: 'current' | 'edited',
  userId: string,
): AsyncGenerator<{ type: 'message' | 'complete'; data: ChatMessage | Conversation }> {
  const openai = createOpenAIClient(apiKey);

  // Resolve variables in system prompt
  const resolvedSystemPrompt = await resolveVariables(systemPrompt, userId);

  const messages: ChatMessage[] = [{ role: 'system', content: resolvedSystemPrompt }];

  // Process each user turn and get AI response
  for (const turn of scenarioTurns) {
    if (turn.turnType === 'USER' && turn.userText) {
      // Resolve variables in user message
      const resolvedUserText = await resolveVariables(turn.userText, userId);

      // Add user message
      const userMessage: ChatMessage = { role: 'user', content: resolvedUserText };
      messages.push(userMessage);

      // Yield user message immediately
      yield { type: 'message', data: userMessage };

      // Get AI response
      try {
        const aiResponse = await chatCompletion(
          openai,
          modelConfig.model,
          messages,
          modelConfig.model.startsWith('gpt-5')
            ? {
                reasoning_effort: modelConfig.reasoningEffort,
                verbosity: modelConfig.verbosity,
                service_tier: modelConfig.serviceTier,
              }
            : {},
          { timeoutMs: 60_000 },
        );
        const assistantMessage: ChatMessage = { role: 'assistant', content: aiResponse };
        messages.push(assistantMessage);

        // Yield AI response immediately
        yield { type: 'message', data: assistantMessage };
      } catch (error) {
        getLogger().error('OpenAI API error', { error: String(error) });
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: '[Error: Failed to get AI response]',
        };
        messages.push(errorMessage);

        // Yield error message
        yield { type: 'message', data: errorMessage };
      }
    }
  }

  // Format model display
  const options = [];
  if (modelConfig.reasoningEffort && modelConfig.reasoningEffort !== 'medium') {
    options.push(`reasoning: ${modelConfig.reasoningEffort}`);
  }
  if (modelConfig.verbosity && modelConfig.verbosity !== 'medium') {
    options.push(`verbosity: ${modelConfig.verbosity}`);
  }
  if (modelConfig.serviceTier && modelConfig.serviceTier !== 'default') {
    options.push(`priority: ${modelConfig.serviceTier}`);
  }

  const modelDisplay =
    options.length > 0 ? `${modelConfig.model} (${options.join(', ')})` : modelConfig.model;

  // Yield final conversation
  const finalConversation: Conversation = {
    title: `Simulation · ${promptType === 'current' ? 'Current' : 'Edited'} Prompt · ${modelDisplay}`,
    messages: messages.slice(1), // Remove system message from display
  };

  yield { type: 'complete', data: finalConversation };
}

export async function POST(req: NextRequest) {
  try {
    // Ensure encryption key is configured; treat as server misconfiguration if missing
    try {
      ensureCryptoReady();
    } catch {
      getLogger(req).error('ENCRYPTION_KEY not configured');
      return NextResponse.json(
        { error: 'Server misconfigured: ENCRYPTION_KEY is missing' },
        { status: 500 },
      );
    }

    const user = await getCurrentUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const raw = await req.json();
    const parsed = SimulateRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return errorJson('Invalid simulate payload', {
        status: 400,
        details: parsed.error.flatten(),
      });
    }
    const body = parsed.data as any;

    // Get user's OpenAI API key
    const apiKey = await getUserApiKey(user.id);
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not found. Please configure your API key in Settings.',
        },
        { status: 400 },
      );
    }

    // Use modelConfig if available, fallback to legacy model parameter
    const modelConfig = body.modelConfig || { model: body.model || 'gpt-4' };

    // First check if it's a predefined scenario (built-in scenario support)
    let scenarioTurns: ScenarioTurn[] = [];
    let scenarioName = '';

    const predefinedScenario = getScenarioByKey(body.scenarioKey);
    if (predefinedScenario) {
      // Convert predefined scenario to turns format
      scenarioTurns = predefinedScenario.seed.messages
        .filter((m) => m.role === 'user')
        .map((m, index) => ({
          orderIndex: index,
          turnType: 'USER',
          userText: m.content,
        }));
      scenarioName = predefinedScenario.name;
    } else {
      // Fetch scenario from database
      const scenario = await getScenarioById(body.scenarioKey, user.id);
      if (!scenario) {
        return NextResponse.json({ error: 'Scenario not found' }, { status: 400 });
      }
      scenarioTurns = scenario.turns.map((t) => ({
        ...t,
        userText: t.userText ?? undefined,
      }));
      scenarioName = scenario.name;
    }

    if (scenarioTurns.length === 0) {
      return NextResponse.json({ error: 'Scenario has no user turns' }, { status: 400 });
    }

    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendEvent = (data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Send initial status
          sendEvent({
            type: 'start',
            scenarioName,
            totalTurns: scenarioTurns.filter((t) => t.turnType === 'USER').length,
          });

          // Run both simulations concurrently but stream results separately
          const currentStream = streamSimulation(
            body.oldPrompt,
            scenarioTurns,
            modelConfig,
            apiKey,
            'current',
            user.id,
          );
          const editedStream = streamSimulation(
            body.newPrompt,
            scenarioTurns,
            modelConfig,
            apiKey,
            'edited',
            user.id,
          );

          const processStreams = async () => {
            const promises = [];

            // Process current prompt stream
            promises.push(
              (async () => {
                for await (const event of currentStream) {
                  sendEvent({
                    type: event.type,
                    promptType: 'current',
                    data: event.data,
                  });
                }
              })(),
            );

            // Process edited prompt stream
            promises.push(
              (async () => {
                for await (const event of editedStream) {
                  sendEvent({
                    type: event.type,
                    promptType: 'edited',
                    data: event.data,
                  });
                }
              })(),
            );

            await Promise.all(promises);
          };

          await processStreams();

          // Send final completion event
          sendEvent({ type: 'done' });
        } catch (error) {
          getLogger().error('Streaming error', { error: String(error) });
          sendEvent({
            type: 'error',
            error: 'Simulation failed. Please check your API key and try again.',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    getLogger(req).error('Simulation error', { error: String(error) });
    return NextResponse.json(
      {
        error: 'Simulation failed. Please check your API key and try again.',
      },
      { status: 500 },
    );
  }
}
