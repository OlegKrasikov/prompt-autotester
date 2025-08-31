import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function getCurrentUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session?.user || null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}
