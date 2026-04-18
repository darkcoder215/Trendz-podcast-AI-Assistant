import 'server-only';
import { env } from './env';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1';

function headers() {
  return {
    Authorization: `Bearer ${env.OPENROUTER_API_KEY()}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': env.OPENROUTER_SITE_URL(),
    'X-Title': env.OPENROUTER_APP_NAME(),
  };
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function chatCompletion(opts: {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
}): Promise<{ text: string; model: string }> {
  const body = {
    model: opts.model ?? env.CHAT_MODEL(),
    messages: opts.messages,
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens ?? 1200,
    stream: false,
  };
  const res = await fetch(`${OPENROUTER_URL}/chat/completions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter chat failed (${res.status}): ${await res.text()}`);
  }
  const j = await res.json();
  return { text: j.choices?.[0]?.message?.content ?? '', model: j.model ?? body.model };
}

/**
 * Embed an array of strings. OpenRouter proxies this to OpenAI's embedding
 * endpoint; the request shape matches the OpenAI API.
 */
export async function embed(inputs: string[], model?: string): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const body = {
    model: model ?? env.EMBED_MODEL(),
    input: inputs,
  };
  const res = await fetch(`${OPENROUTER_URL}/embeddings`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter embed failed (${res.status}): ${await res.text()}`);
  }
  const j = await res.json();
  // Some providers return data unordered; sort by index defensively.
  const items = (j.data as { index: number; embedding: number[] }[]).sort((a, b) => a.index - b.index);
  return items.map((x) => x.embedding);
}

export async function embedOne(input: string): Promise<number[]> {
  const [v] = await embed([input]);
  return v;
}
