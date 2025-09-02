import { NextRequest, NextResponse } from 'next/server';
import { requireOrgContext } from '@/server/auth/orgContext';
import { can } from '@/server/auth/rbac';
import { getLogger } from '@/server/logging/logger';
import { apiKeysService } from '@/server/services/apiKeysService';
import { encrypt, ensureCryptoReady } from '@/server/utils/crypto';

// GET - Retrieve user's API keys
export async function GET(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);
    if (!ctx?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!can(ctx as any, 'settings', 'settings')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const apiKeys = await apiKeysService.listActive(ctx);

    return NextResponse.json({ apiKeys });
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return NextResponse.json({ error: 'Organization required' }, { status: 403 });
    }
    getLogger(request).error('Error fetching API keys', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or update API key
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);
    if (!ctx?.userId) {
      return NextResponse.json(
        {
          error: 'Please log in to save API keys',
          userMessage: 'Authentication required',
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { provider, keyName, apiKey } = body;

    if (!can(ctx as any, 'settings', 'settings')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!provider || !apiKey) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          userMessage: 'Please provide both provider and API key',
        },
        { status: 400 },
      );
    }

    // Basic API key format validation
    if (provider === 'openai' && (!apiKey.startsWith('sk-') || apiKey.length < 20)) {
      return NextResponse.json(
        {
          error: 'Invalid API key format',
          userMessage: "OpenAI API keys should start with 'sk-' and be at least 20 characters long",
        },
        { status: 400 },
      );
    }

    // Ensure encryption is configured
    try {
      ensureCryptoReady();
    } catch {
      return NextResponse.json(
        {
          error: 'Server misconfiguration',
          userMessage: 'Missing ENCRYPTION_KEY on server. Please contact admin.',
        },
        { status: 500 },
      );
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey);

    // Check if API key already exists for this user and provider (including inactive ones)
    const result = await apiKeysService.upsertActive(
      ctx,
      provider,
      keyName || `${provider} API Key`,
      encryptedKey,
    );

    return NextResponse.json({
      message: 'API key saved successfully',
      apiKey: result,
    });
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return NextResponse.json({ error: 'Organization required' }, { status: 403 });
    }
    getLogger(request).error('Error saving API key', { error: String(error) });

    // Provide user-friendly error messages based on error type
    if (error instanceof Error) {
      if (
        error.message.includes('UNIQUE constraint failed') ||
        error.message.includes('Unique constraint')
      ) {
        return NextResponse.json(
          {
            error: 'API key already exists',
            userMessage:
              'You already have an API key for this provider. Please remove the existing one first.',
          },
          { status: 409 },
        );
      }

      if (error.message.includes('Database') || error.message.includes('Connection')) {
        return NextResponse.json(
          {
            error: 'Database connection error',
            userMessage: 'Unable to connect to the database. Please try again in a moment.',
          },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to save API key',
        userMessage: 'Something went wrong while saving your API key. Please try again.',
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const ctx = await requireOrgContext(request);
    if (!ctx?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    if (!can(ctx as any, 'settings', 'settings')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await apiKeysService.deactivate(ctx, provider);

    return NextResponse.json({ message: 'API key deleted successfully' });
  } catch (error) {
    if ((error as Error).message === 'ORG_REQUIRED') {
      return NextResponse.json({ error: 'Organization required' }, { status: 403 });
    }
    getLogger(request).error('Error deleting API key', { error: String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
