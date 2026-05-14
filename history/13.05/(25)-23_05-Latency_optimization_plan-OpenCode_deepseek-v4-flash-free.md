User request: "optimize bot's latency"

## Objective Reconstruction
Analyze the full latency breakdown of an AI chat request (17.6s total) and create an optimization plan covering: prompt deduplication, prompt compression, caching strategy, classifier speed, OpenRouter log auto-fetch, and production profiling.

## Strategic Reasoning
- Traced the full request path through chainRouter.ts, compilePrompt.ts, openrouter.ts, and store.ts
- Compared app logs (17.4s application) against OpenRouter generation data (8s inference + 0.76s latency)
- Identified 3x [RESTRICTIONS] duplication in the system prompt payload
- Found DeepSeek V4 Flash supports automatic prompt caching via Cache Read pricing ($0.0028/M)
- Determined the 5.7s SSE gap is likely dev-mode Turbopack overhead

## Operational Trace
- Read chainRouter.ts to trace full request flow
- Read compilePrompt.ts to understand global prompt composition
- Read the DeepSeek V4 Flash model spec (web data.txt)
- Read openrouter.ts provider file
- Analyzed the user's OpenRouter generation data
- Wrote docs/plans/latency-optimization-plan.md with 6 prioritized items

## Status Assessment
Plan complete at docs/plans/latency-optimization-plan.md. Covers 6 optimization items ranked by impact: profile in production (5s free), condense global prompt (30s saved), deduplicate RESTRICTIONS (12s saved), in-memory caching (50ms), classifier speed (1s), OpenRouter log tracking (quality of life).
