import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({
  apiKey,
  timeout: Number(process.env.EXTRACT_OPENAI_TIMEOUT_MS ?? 60_000),
  maxRetries: 1,
});

export const EXTRACT_MODEL =
  process.env.OPENAI_EXTRACT_MODEL ?? "gpt-4o-2024-08-06";
