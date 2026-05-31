/**
 * Central AI provider configuration.
 *
 * We use Vercel AI SDK to abstract over LLM providers — swap from Gemini
 * to Claude/OpenAI/etc. without touching agent code.
 *
 * Default: Google Gemini 2.0 Flash
 *   - 33× cheaper than GPT-4o on both input and output
 *   - Native PDF + image support
 *   - 1M token context window
 *   - Structured outputs via Zod schemas
 *
 * Set GOOGLE_GENERATIVE_AI_API_KEY in your env file.
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Lazy client — instantiated on first access, not at import time.
// This keeps the build green even when the API key isn't set
// (e.g. during `next build` in CI).
let _google: ReturnType<typeof createGoogleGenerativeAI> | null = null;

function google() {
  if (_google) return _google;
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is not set. Get one at https://aistudio.google.com/apikey"
    );
  }
  _google = createGoogleGenerativeAI({ apiKey });
  return _google;
}

/**
 * Multimodal model for document extraction (PDF + images).
 * Override per-environment via GEMINI_EXTRACT_MODEL.
 */
export const extractModel = () =>
  google()(process.env.GEMINI_EXTRACT_MODEL ?? "gemini-2.0-flash-001");

/**
 * Text-only model for HS code classification + supplier matching.
 * Fast + cheap, returns structured JSON via Zod.
 */
export const classifierModel = () =>
  google()(process.env.GEMINI_CLASSIFIER_MODEL ?? "gemini-2.0-flash-001");

/**
 * Embedding model used by HS Code RAG + supplier matcher.
 * text-embedding-004 outputs 768 dimensions by default.
 *
 * IMPORTANT: pgvector columns must be `vector(768)` to match.
 * If you ran the original migrations with `vector(1536)`, run:
 *   alter table hs_code_reference alter column embedding type vector(768) using null;
 *   alter table suppliers alter column embedding type vector(768) using null;
 *   alter table supplier_products alter column embedding type vector(768) using null;
 *   alter table rfqs alter column embedding type vector(768) using null;
 *   -- then re-create the HNSW indexes
 */
export const embeddingModel = () =>
  google().textEmbeddingModel(
    process.env.GEMINI_EMBEDDING_MODEL ?? "text-embedding-004"
  );

export const EMBEDDING_DIMENSIONS = 768;
