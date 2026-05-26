import OpenAI from "openai";

/**
 * Lazy OpenAI client. Constructed on first use, NOT at module-load time.
 *
 * Why: Next.js statically analyzes every API route during `next build` to
 * collect page metadata. If this module threw at import time (e.g. when
 * OPENAI_API_KEY isn't set), the build itself would fail — preventing
 * deployment of unrelated pages.
 *
 * Instead, throw only when an agent actually tries to call OpenAI at runtime.
 */

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "sk-placeholder") {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it in Vercel → Settings → Environment Variables."
    );
  }
  _client = new OpenAI({
    apiKey,
    timeout: Number(process.env.EXTRACT_OPENAI_TIMEOUT_MS ?? 60_000),
    maxRetries: 1,
  });
  return _client;
}

/**
 * Proxy that forwards every property access to the lazily-built client.
 * Lets callers write `openai.chat.completions...` without any code change.
 */
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

export const EXTRACT_MODEL =
  process.env.OPENAI_EXTRACT_MODEL ?? "gpt-4o-2024-08-06";
