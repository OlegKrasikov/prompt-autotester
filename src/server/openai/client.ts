import { OpenAI } from "openai";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  timeoutMs?: number;
  maxRetries?: number;
}

export function createOpenAIClient(apiKey: string) {
  // Optionally we could pass timeouts here if supported by sdk
  const client = new OpenAI({ apiKey });
  return client;
}

export async function chatCompletion(
  client: OpenAI,
  model: string,
  messages: ChatMessage[],
  extra: Record<string, unknown> = {},
  opts: ChatOptions = { timeoutMs: 60_000, maxRetries: 1 }
): Promise<string> {
  let lastError: unknown;
  const max = Math.max(1, opts.maxRetries ?? 1);
  for (let attempt = 0; attempt < max; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);
    try {
      const resp = await client.chat.completions.create(
        {
          model,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          ...extra,
        } as any,
        { signal: controller.signal }
      );
      return resp.choices?.[0]?.message?.content ?? "";
    } catch (err: any) {
      lastError = err;
      const isAbort = err?.name === 'AbortError';
      const status = err?.status ?? err?.code;
      const retriable = isAbort || status === 429 || (status >= 500 && status < 600);
      if (attempt < max - 1 && retriable) {
        const backoff = 500 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}
