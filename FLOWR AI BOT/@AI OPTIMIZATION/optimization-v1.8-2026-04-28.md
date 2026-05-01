# AI Optimization Plan — v1.8
Created: 2026-04-28
Last modified: 2026-04-28 by Claude Sonnet 4.6
Scope: both
Author: Claude Sonnet 4.6
Status: DRAFT — awaiting user review

---

## Executive Summary

- **Platform unification**: Removed app/telegram split — single routing table, both clients use the same chains. Eliminates 18-row duplication and fallback complexity.
- **Gemma 4 26B/31B** (Google, 1,500 RPD, unlimited TPM) promoted to primary for MEDIUM and COMPLEX — best quota-to-capability ratio available.
- **Ollama local provider** wired in: user's machine serves all users when running; max 1 model per chain; global on/off toggle in Bot Settings.
- **Cloudflare AI Workers** restored as #1 for IMAGE_GEN (100K RPD); Imagen 4 as quality fallback.
- **OpenRouter** corrected to 50 RPD/account — demoted to last-resort; HuggingFace added as scalable free-tier fallback instead.

---

## Current State Audit

### What's Working
- Intent classification with fallback (Gemini 3.1 Flash Lite → Groq)
- Multi-model sequential failover with exception catch
- Vision flow via router chain (not hardcoded)
- Tool calling up to 4 hops (Google + Groq both wired)
- Web search grounding (Google native + Tavily fallback)
- Compiled prompt injection with global_enabled flag
- HuggingFace provider exists in chainRouter (`provider: 'huggingface'`)
- `provider: 'local'` already typed in router-config.ts and store.types.ts
- RouterManager UI already has Ollama color definitions

### What's Not Working / Gaps
- **Gemini 2.5 Flash at 20 RPD** was in multiple chain primaries — rate-limits in minutes under real usage
- **OpenRouter documented at 200 RPD** — actual is 50 RPD/account; chains over-relied on it
- **No `case 'local':` in chainRouter** — local provider typed but never dispatched
- **Platform fallback complexity**: app→telegram fallback in 3 places (vision, classifier, standard) — unnecessary once unified
- **HuggingFace not used** in any chain despite provider being wired
- **Cloudflare demoted in v1.7** — was removed from IMAGE_GEN primary; should always be #1 at 100K RPD
- **WORKFLOW OVERVIEW.md** references `gemini-1.5-flash-latest` for vision — codebase uses router chain

---

## Optimization Proposals

### 1. Platform Unification
**Problem**: 9 categories × 2 platforms = 18 rows; app chains mostly empty, fallback to telegram anyway.
**Change**: Remove `platform` param from `getRouterChain`, `classifyIntentWithModel`, `runChain`. Query hardcodes `'telegram'` (canonical). Drop all `platform = 'app'` rows from DB.
**Files**: `router-config.ts`, `chainRouter.ts`, `classifier.ts`, `chat/route.ts`, `router/page.tsx`, `app/router/page.tsx`, `telegram/router/page.tsx`, `router/actions.ts`
**Impact**: High — removes dead code, single source of truth for chain config
**Effort**: Medium
**Risk**: Low — app was already using telegram chains via fallback

### 2. Ollama Local Provider
**Problem**: `provider: 'local'` is typed but chainRouter has no handler. User wants their machine as a provider.
**Change**: Add `src/lib/bot/providers/ollama.ts` + `case 'local':` in chainRouter. Reads `ollama_enabled` from DB before dispatching. Add toggle in Bot Settings.
**Files**: new `providers/ollama.ts`, `chainRouter.ts`, `bot/settings/actions.ts`, `settings/SettingsClient.tsx`, `settings/page.tsx`, migration
**Impact**: High — unlocks local model routing for all users
**Effort**: Low (provider pattern already established)
**Risk**: Low — gracefully returns null if Ollama not running

### 3. Updated Chain Quotas
**Problem**: v1.7 chains used deprecated/low-quota models as primaries.
**Change**: Promote Gemma 4 26B/31B to primary for MEDIUM/COMPLEX; demote Gemini 2.5 Flash to last resort; fix Cloudflare as IMAGE_GEN #1; remove OpenRouter from non-last-resort slots.
**Files**: DB router_chains rows only (via admin UI — no code change)
**Impact**: High — prevents frequent 20-RPD quota exhaustion
**Effort**: Low
**Risk**: None

### 4. HuggingFace as Final Fallback
**Problem**: HuggingFace provider is wired in code but unused in chains.
**Change**: Add HF models as final fallbacks in FAST, MEDIUM, COMPLEX, IMAGE_GEN chains via admin UI.
**Files**: DB only
**Impact**: Medium — improves resilience when all other providers rate-limit
**Effort**: Low (requires HF token in vault as `HUGGING_FACE_TOKEN`)
**Risk**: Low — HF inference API can be slow; position as last fallback only

---

## Cloud-Specific Improvements

- Restore Cloudflare as IMAGE_GEN primary — 100K RPD is unmatched for scale
- Promote Gemma 4 26B (1,500 RPD, unlimited TPM) to MEDIUM primary — best free quota Google offers
- Keep Groq Llama 3.3 70B + GPT-OSS 120B as COMPLEX/TOOL primary — 1K RPD each, fastest inference
- Remove Gemini 2.5 Flash from any primary/secondary slot — 20 RPD is unusable at scale

## Local-Specific Improvements

- Wire Ollama as `provider: 'local'` in chainRouter
- Global toggle in Bot Settings (default off)
- When enabled, chain entries with `provider: 'local'` are dispatched to `http://localhost:11434`
- Falls through silently if Ollama is down or disabled

## Cross-Cutting Improvements

- Platform unification removes 3 fallback blocks from hot path (every request was hitting these)
- Single router admin page instead of two identical pages
- HuggingFace as universal last-resort across text chains

---

## Updated Router Chains (v1.7 → v1.8)

### FAST_SIMPLE
| # | Model | Provider | RPD |
|---|-------|----------|-----|
| 1 | `llama-3.1-8b-instant` | Groq | 14,400 |
| 2 | `openai/gpt-oss-20b` | Groq | 1,000 |
| 3 | `gemini-3.1-flash-lite` | Google | 500 |
| 4 | *(your ollama model)* | local | ∞ if running |
| 5 | `mistralai/Mistral-7B-Instruct-v0.3` | HuggingFace | free |

### MEDIUM_THINKING
| # | Model | Provider | RPD |
|---|-------|----------|-----|
| 1 | `gemma-4-26b-a4b-it` | Google | 1,500 ← promoted |
| 2 | `llama-3.3-70b-versatile` | Groq | 1,000 |
| 3 | `qwen/qwen3-32b` | Groq | 1,000 |
| 4 | `openai/gpt-oss-120b` | Groq | 1,000 |
| 5 | `gemini-3.1-flash-lite` | Google | 500 |
| 6 | *(your ollama model)* | local | ∞ if running |
| 7 | `mistralai/Mistral-7B-Instruct-v0.3` | HuggingFace | free |

### COMPLEX_THINKING
| # | Model | Provider | RPD |
|---|-------|----------|-----|
| 1 | `openai/gpt-oss-120b` | Groq | 1,000 |
| 2 | `qwen/qwen3-32b` | Groq | 1,000 |
| 3 | `gemma-4-31b-it` | Google | 1,500 ← promoted |
| 4 | `llama-3.3-70b-versatile` | Groq | 1,000 |
| 5 | `gemini-3.1-flash-lite` | Google | 500 |
| 6 | *(your ollama model)* | local | ∞ if running |
| 7 | `meta-llama/Meta-Llama-3-8B-Instruct` | HuggingFace | free |

### TOOL_CALLING
| # | Model | Provider | RPD |
|---|-------|----------|-----|
| 1 | `llama-3.3-70b-versatile` | Groq | 1,000 |
| 2 | `openai/gpt-oss-120b` | Groq | 1,000 |
| 3 | `gemma-4-26b-a4b-it` | Google | 1,500 |
| 4 | `gemini-3.1-flash-lite` | Google | 500 |

### WEB_SEARCH
| # | Model | Provider | RPD |
|---|-------|----------|-----|
| 1 | `google-search-grounding` | Google | 1,500 |
| 2 | `openai/gpt-oss-120b` | Groq | 1,000 |
| 3 | `gemini-3.1-flash-lite` | Google | 500 |
| 4 | `tavily-search` | vault | — |

### IMAGE_GEN
| # | Model | Provider | RPD |
|---|-------|----------|-----|
| 1 | `cloudflare-workers-ai` | Cloudflare | 100,000 ← restored #1 |
| 2 | `imagen-4-fast-generate` | Google | 25 |
| 3 | `imagen-4-generate` | Google | 25 |
| 4 | `imagen-4-ultra-generate` | Google | 25 |
| 5 | `stabilityai/stable-diffusion-3.5-large` | HuggingFace | free |

### CLASSIFIER
| # | Model | Provider | RPD |
|---|-------|----------|-----|
| 1 | `gemini-3.1-flash-lite` | Google | 500 |
| 2 | `llama-3.1-8b-instant` | Groq | 14,400 |

---

## Open Questions / Decisions Needed

1. Which Ollama model ID do you want in each chain? (e.g. `llama3.2`, `qwen2.5`, `mistral`) — set via admin router UI
2. Should `gemini-2.5-flash` (20 RPD) be kept as absolute last resort in COMPLEX, or removed entirely?
3. Should the old `platform = 'app'` rows in `router_chains` be deleted via migration, or left as orphans?
