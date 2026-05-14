# Precise Token, Cost, Cache & Reasoning Tracking in Chain Pill Modal

## Summary

Captured real token usage, cost, caching data, and model reasoning/thinking from AI provider API responses and displayed them in the StepTraceModal (pill click modal) in the admin logs page.

## Files Changed (12 files)

### Core Types & Tracing
- **`src/lib/bot/tracing.ts`** — Added `ProviderUsage` interface, extended `StepTrace` with `prompt_tokens`, `completion_tokens`, `total_tokens`, `cache_read_input_tokens`, `cost`, `reasoning`. Updated `TraceCollector.run()` and `recordSuccess()` to accept and store all new fields.

### Provider Implementations (8 files)
- **`src/lib/bot/providers/openrouter.ts`** — Extracts `usage` (prompt_tokens, completion_tokens, total_tokens, cache_read_input_tokens, cache_creation_input_tokens) and `reasoning` from both non-streaming and SSE streaming responses.
- **`src/lib/bot/providers/google.ts`** — Extracts `usageMetadata` (promptTokenCount, candidatesTokenCount, totalTokenCount) and thought parts (`parts[].thought`) for Gemini Thinking models.
- **`src/lib/bot/providers/groq.ts`** — Extracts `usage` (prompt_tokens, completion_tokens, total_tokens) and optional `reasoning`.
- **`src/lib/bot/providers/huggingface.ts`** — Extracts `usage` and `reasoning` if present (OpenAI-compatible endpoint).
- **`src/lib/bot/providers/siliconflow.ts`** — Extracts `usage` if present.
- **`src/lib/bot/providers/pollinations.ts`** — Extracts `usage` if present.
- **`src/lib/bot/providers/ollama.ts`** — Extracts `usage` if present.
- **`src/lib/bot/chainRouter.ts`** — Wires usage + reasoning from provider responses into `StepTrace` via `tracer.recordSuccess()`. Computes actual cost from token counts × model pricing. Replaces `estimateTokens()` heuristic with actual `total_tokens` from provider when available.

### UI
- **`src/app/admin/logs/LogsTable.tsx`** — Updated `StepTraceModal` with:
  - Usage stats bar below header showing prompt/completion/total tokens, cost, cache info
  - New "Reasoning" tab showing model's internal thinking/reasoning (between Input and Output)
  - Graceful blank display when provider doesn't return data

## Data Flow

```
Provider API → Provider function extracts `usage` + `reasoning` from response
  → chainRouter.ts passes to tracer.recordSuccess()
    → StepTrace stored in context_messages JSONB (no migration needed)
      → LogsTable reads from DB → StepTraceModal displays stats bar + reasoning tab
```

## Provider Coverage

| Provider | Usage Data | Reasoning | Cost |
|----------|-----------|-----------|------|
| OpenRouter | prompt/completion/total tokens, cache info | DeepSeek R1, Qwen etc. | Computed from tokens × pricing |
| Google/Gemini | prompt/completion/total tokens | Thinking models (thought parts) | Computed from tokens × pricing |
| Groq | prompt/completion/total tokens | Reasoning models | Computed from tokens × pricing |
| HuggingFace | If returned by API | If returned by API | Computed from tokens × pricing |
| SiliconFlow | If returned by API | — | Computed from tokens × pricing |
| Pollinations | If returned by API | — | Computed from tokens × pricing |
| Ollama | If returned by API | — | Computed from tokens × pricing |
| Cloudflare | No usage data | — | — |

## No Database Migration Needed

All new fields flow through the existing `context_messages` JSONB column (stores `step_traces`). No schema changes required.
