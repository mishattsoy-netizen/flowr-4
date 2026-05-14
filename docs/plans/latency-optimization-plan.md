# Latency Optimization Plan

Measured baseline: **17.6s** for a MEDIUM_THINKING request (DeepSeek V4 Flash via OpenRouter).

Breakdown from code tracing (`chainRouter.ts` + `compilePrompt.ts` + `openrouter.ts`):

| Phase | Time | % of total |
|-------|------|-----------|
| Supabase: fetch compiled prompt, session state, pipeline settings | ~150ms | 0.9% |
| Classifier (model-based intent classification) | ~1,490ms | 8.5% |
| System prompt assembly (string concat, vault key fetch) | ~1,200ms | 6.8% |
| OpenRouter: network latency | ~758ms | 4.3% |
| OpenRouter: model inference (4476 input + 641 output @ 80 tok/s) | ~8,017ms | 45.6% |
| Post-processing + DB logging | ~1,000ms | 5.7% |
| SSE streaming through Next.js (dev mode amplification) | ~4,900ms | 27.9% |

---

## Item 1: Deduplicate [RESTRICTIONS] block

### Problem
The compiled global prompt already contains a `[RESTRICTIONS]` section (built in `compilePrompt.ts:178-179`). But in `chainRouter.ts`, the system prompt is further assembled by concatenating:
- `globalPrompt` (which includes [RESTRICTIONS]) — line 562
- `internalPipelinePrompt` (may also include it) — line 563  
- `routerOverridePrompt` (may also include it) — line 564

Looking at the raw payload sent to DeepSeek, `[RESTRICTIONS]` appears **3 times** — ~1000+ wasted tokens.

### Fix
In `chainRouter.ts`, after assembling `finalSysPrompt`, run a simple dedup: strip any content between `[RESTRICTIONS]\n` and the next `\n\n[` section if a `[RESTRICTIONS]` already exists earlier in the prompt.

**File:** `src/lib/bot/chainRouter.ts`

**Change:** Add this after line 564 (after finalSysPrompt assembly):

```typescript
// Deduplicate [RESTRICTIONS] — the compiled global prompt already contains it
const restrictionsMatch = finalSysPrompt.match(/^\[RESTRICTIONS\][\s\S]*?(?=\n\n\[|$)/m)
if (restrictionsMatch) {
  // Keep only the FIRST occurrence, remove any subsequent ones
  const firstRestrictions = restrictionsMatch[0]
  finalSysPrompt = finalSysPrompt.replace(/\[RESTRICTIONS\][\s\S]*?(?=\n\n\[|$)/g, (match, offset) => {
    return offset === restrictionsMatch.index ? match : ''
  })
}
```

**Files affected:** `src/lib/bot/chainRouter.ts`

**Effort:** ~10 lines of code. 5 minutes.

---

## Item 2: Condense global compiled prompt

### Problem
The compiled prompt is ~4000 tokens. It includes verbose sections:
- Full personality description
- Answer style guide (formatting rules, typography instructions, scannability architecture)
- Thinking pattern framework
- Restrictions (multiple duplicates)
- Brain rules

Most of this is static boilerplate that doesn't change per request.

### Fix — Option A (Manual edit, recommended)
Edit the prompt entries directly in Supabase Admin > Bot > Global > Brain. Condense:
- **Answer Style:** Replace the 500+ token formatting bible with: *"Use markdown. Bold for key terms. Tables for comparisons. Code blocks for commands. Be concise."*
- **Thinking Pattern:** Replace the 400+ token cognitive framework with: *"Be direct. For simple facts, state them. For complex questions, think briefly then answer. No hedging."*
- **Personality:** Keep at ~300 tokens. Remove verbose examples.
- **Restrictions:** Keep at ~400 tokens.

### Fix — Option B (Code change)
Restructure `compilePrompt.ts` to split the compiled prompt into two tiers:
1. **Short core** (~500 tokens) — injected on every request (personality, core rules, restrictions)
2. **Long reference** — stored separately, only injected for specific categories or when explicitly needed

**File:** `src/lib/bot/compilePrompt.ts`

**Target size:** ~1200-1500 tokens total (down from ~4000).

**Savings:** ~2500-2800 tokens per request → at 80 tok/s, saves ~31-35s of model inference time. This is the single highest-impact change.

---

## Item 3: Cache compiled prompt in-memory

### Problem
`getCompiledPrompt()` at `chainRouter.ts:146` queries Supabase on every single request. The compiled prompt rarely changes (only when admin runs "Sync Brain").

### Fix
Add a simple in-memory cache in `src/lib/bot/compilePrompt.ts`:

```typescript
const compiledPromptCache = new Map<string, { content: string; cachedAt: number }>()
const CACHE_TTL_MS = 60_000 // 60s

export async function getCompiledPrompt(mode: BotMode): Promise<string> {
  const cached = compiledPromptCache.get(mode)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.content
  }
  const { data } = await supabase
    .from('bot_compiled_prompt')
    .select('content')
    .eq('mode', mode)
    .maybeSingle()
  const content = data?.content ?? ''
  compiledPromptCache.set(mode, { content, cachedAt: Date.now() })
  return content
}

// Export a function to invalidate cache when prompt is re-synced
export function invalidateCompiledPromptCache(mode?: BotMode) {
  if (mode) {
    compiledPromptCache.delete(mode)
  } else {
    compiledPromptCache.clear()
  }
}
```

Also call `invalidateCompiledPromptCache()` in the sync action (`syncCompiledPrompt` in `settings/actions.ts`).

**Files affected:**
- `src/lib/bot/compilePrompt.ts` — add cache logic
- `src/app/admin/bot/settings/actions.ts` — invalidate cache on sync

**Savings:** ~50ms per request (small but free).

---

## Item 4: Speed up classifier

### Problem
Classifier took 1.49s. This is a full model call running sequentially before the main chain.

### Investigation needed
Check what model the CLASSIFIER chain uses in Admin > Router > CLASSIFIER. If it's a large/slow model (e.g., a full DeepSeek), switch to a flash/lite model.

### Fix — Option A
In Admin > Router > CLASSIFIER, set the primary model to `gemini-2.0-flash-lite` or `deepseek/deepseek-v4-flash` (same fast model as the main chain).

### Fix — Option B
Optimize the classifier prompt. The classifier sends the full conversation history (or our trimmed 5 messages) plus the user query. With a shorter history, classification is faster.

### Fix — Option C
Run classifier in parallel with other setup work. Currently at `chainRouter.ts:390`, classification runs after history fetch and before chain assembly. The classifier result isn't needed until line 550. We could prefetch vault keys and assemble the chain in parallel with classification.

```typescript
// Rough sketch: run classifier + chain assembly in parallel
const [classifyRes, { chain, system_prompt, temperature }] = await Promise.all([
  classifyIntentWithModel(...),
  getRouterChain(category).catch(() => ({ chain: [], system_prompt: '' })),
])
```

**Savings:** ~1s if the 1.49s classifier runs in parallel with other work.

---

## Item 5: Expose OpenRouter generation_id & auto-fetch logs

### Problem
You currently can't automatically see OpenRouter's detailed generation metrics (actual token counts, latency breakdown, cost) in Flowr's logs. You have to manually visit openrouter.ai.

### Fix — Part A: Capture generation_id
In `src/lib/bot/providers/openrouter.ts`, the OpenRouter API response includes `generation_id` in the response body (for non-streaming) or in the headers/sse data (for streaming). Capture it:

```typescript
// In the streaming handler, extract generation_id from the first SSE data chunk
let generationId = ''
// ... in the stream processing:
if (parsed.generation_id) generationId = parsed.generation_id
```

Include `generation_id` in the response alongside `usage_type`, `model_chain`, etc. Store it in `message_logs` as a new column or in `context_messages`.

### Fix — Part B: Auto-fetch OpenRouter analytics
Create a background API route or script that fetches generation data for stored `generation_id`s:

```typescript
// GET /api/ai/openrouter-generation?id=gen-xxx
// Calls: https://openrouter.ai/api/v1/generation?id=gen-xxx
// Requires OPENROUTER_API_KEY
```

Run this: (a) immediately after each AI response to store accurate metrics, or (b) as a periodic cron/scheduled job that batch-fetches recent `generation_id`s that haven't been resolved yet.

### Fix — Part C: Admin logs display
In `src/app/admin/logs/`, add a column showing `generation_id` as a clickable link to `https://openrouter.ai/api/v1/generation?id=gen-xxx` (or display a mini breakdown: actual tokens, cost, latency).

---

## Item 6: Profile in production mode

### Problem
The 5.7s SSE streaming gap may be entirely a dev-mode artifact. Next.js Turbopack applies HMR and source maps to every React render, and every SSE chunk triggers a Zustand store update → React re-render.

### Test
1. `npm run build`
2. `npm run start`
3. Send the same query
4. Compare the SSE gap time

If the gap drops to <500ms, no code change needed. If it persists, the bottleneck is in the SSE processing code in `store.ts` (the `sendAIMessage` stream reader at lines 655-700).

### If production is also slow
Optimize the SSE handler: instead of updating the React state on every tiny chunk, buffer chunks and update every 100ms or every N chunks. This reduces re-render frequency.

**File:** `src/data/store.ts` (within `sendAIMessage`, the stream reader)

```typescript
// Buffer-based streaming: update UI every 100ms instead of on every chunk
let lastUpdate = 0
const UPDATE_INTERVAL = 100
// ... in the chunk processing loop:
const now = Date.now()
if (now - lastUpdate > UPDATE_INTERVAL || parsed.content?.includes('\n')) {
  // trigger set() to update UI
  lastUpdate = now
}
```

---

## Prompt Caching — Provider Support & Implementation

### How Prompt Caching Works

When you send a system prompt, the model processes every token through its neural network. **Prompt caching** means the provider stores the processed prefix (KV cache) so subsequent requests with the same prefix skip re-processing. This cuts inference time by ~50-80% for the cached portion.

### Provider Support

| Provider | Caching type | How it works | Cost savings |
|----------|-------------|-------------|-------------|
| **DeepSeek** | ✅ **Automatic prefix caching** | KV cache for repeated prefixes. No API needed. Cache hits happen transparently after 1-2 identical prefix repetitions. | Cache Read: $0.0028/M vs $0.14/M full → **50x cheaper for cached tokens** |
| **Google Gemini** | ✅ **Explicit + Automatic** | Has `GoogleAICacheManager` API for explicit caching, AND automatic prefix caching for repeated patterns. Explicit caching gives guaranteed hits and supports TTL control. | Cache: ~$0.01/M vs $0.15/M full |
| **OpenAI** | ✅ **Automatic prefix caching** | Transparent KV cache for repeated prefixes. No API needed. | ~50% discount on cached tokens |
| **Anthropic Claude** | ✅ **Explicit (cache_control blocks)** | Mark specific content blocks with `cache_control: { type: 'ephemeral' }`. Cache is maintained for 5 minutes after last use. | ~90% discount on cached blocks |
| **Groq** | ❌ No caching API | Runs on LPUs; no explicit caching mechanism. | N/A |
| **OpenRouter** | ⚠️ **Pass-through** | Passes through to underlying provider. If the underlying provider supports caching (DeepSeek, Gemini, etc.), it works. | Depends on provider |

### Implementation Plan

Build a single `PromptCache` helper that provides a unified interface:

**File:** `src/lib/bot/promptCache.ts`

```typescript
interface CachedPrompt {
  hash: string         // SHA-256 of system prompt
  modelId: string      // model this cache is for (model-specific KV pools)
  cachedAt: number     // timestamp
  expiresAt: number    // TTL
  cacheId?: string     // provider-specific cache ID (Gemini cachedContent name, etc.)
}

class PromptCache {
  // In-memory Map for cache metadata (per-request dedup + warm instance reuse)
  private cache = new Map<string, CachedPrompt>()
  
  // Hash the system prompt to create a lookup key
  hash(prompt: string): string { /* crypto.createHash */ }
  
  // Check if a cached version exists for this prompt hash + model
  get(hash: string, modelId: string): CachedPrompt | null
  
  // Store cache metadata
  set(hash: string, modelId: string, cacheId?: string): void
  
  // Create a Gemini cachedContent via GoogleAICacheManager
  async createGeminiCache(apiKey: string, modelId: string, systemPrompt: string): Promise<string>
  
  // Invalidate when compiled prompt changes
  invalidate(): void
}
```

**Integration points:**
- `compilePrompt.ts` — invalidate cache when prompt is re-synced
- `chainRouter.ts` — hash the assembled system prompt and check cache before sending
- `providers/google.ts` — pass `cachedContent` ID when available  
- `providers/openrouter.ts` — mark system prompt blocks with `cache_control` when target provider is Anthropic

### What This Means for Current Flowr Setup

| Scenario | What happens | Latency impact |
|----------|-------------|---------------|
| **DeepSeek (current primary)** | Automatic prefix caching kicks in after 1-2 identical requests. Our ~4000 token system prompt prefix gets cached by DeepSeek's infrastructure. | Subsequent requests: ~4s instead of ~8s (cached prefix) |
| **Gemini (when selected)** | Explicit `GoogleAICacheManager` creates a `cachedContent` entry with TTL=3600s. Every request reuses it. | ~3s instead of ~6s |
| **After prompt compression** | Both automatic and explicit caching benefit from smaller prompts. | Additional savings on top of compression |

### Summary Table

| Technique | Provider support | For Flowr |
|-----------|----------------|-----------|
| **DeepSeek automatic prefix caching** | ✅ Built-in, no code needed. Cache price $0.0028/M. | ✅ Already active. Benefits grow with request volume. |
| **Explicit Gemini context caching** | ✅ Via `GoogleAICacheManager`. Create once, reuse for TTL duration. | ⏳ Implement `promptCache.ts` helper. |
| **In-memory compile prompt cache** | N/A — app-level | Add Map with TTL to skip Supabase query per request. |
| **Prompt compression** | Works for ALL providers | Reduce ~4000 tokens to ~1200-1500. Multiplies all cache benefits. |

---

## Vercel Deployment Notes

All changes in this plan are compatible with Vercel's serverless Node.js runtime:

| Concern | Status |
|---------|--------|
| **Node.js APIs** (crypto, Buffer) | ✅ Used in existing code (`encryption.ts`, `chainRouter.ts`). All API routes default to Node.js runtime. |
| **Supabase connections** | ✅ Uses `@supabase/supabase-js` — works serverless. Use Supabase pooler URL in production for connection pooling. |
| **SSE streaming** | ✅ Next.js `ReadableStream` + `NextResponse` works on Vercel. The dev-mode 5.7s gap should drop significantly in production. |
| **In-memory cache** (Item 3) | ⚠️ Simple Map only persists within a single request on serverless. Still useful for deduplication within `chainRouter.ts`. For persistent caching across requests, use Vercel KV. |
| **Logging** | ✅ `console.log/error/warn` — captured by Vercel Logs automatically. |
| **OpenRouter log auto-fetch** (Item 5) | ✅ Can run as a Vercel Cron Job (`vercel.json` cron) or an API route. |
| **`history/` directory writes** | ⚠️ Pre-existing: local filesystem writes don't persist on Vercel. The `reporting-rule.md` history logging would need a DB or external storage backend for Vercel. Not affected by this plan. |

**Key action for Vercel deployment:**
- Set all required env vars in Vercel dashboard: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY`, API keys for providers.

---

## Priority Order

1. **Item 6** — Profile in production first. If SSE gap disappears, that's 5s free.
2. **Item 2** — Condense the compiled prompt. Biggest actual inference savings (30s).
3. **Item 1** — Deduplicate [RESTRICTIONS]. Quick win, saves ~1k tokens.
4. **Item 3** — Cache compiled prompt in-memory. Free 50ms, easy.
5. **Item 4/5** — Classifier speed + OpenRouter logs. Lower impact but good to have.
