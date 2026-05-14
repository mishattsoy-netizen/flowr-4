User request: "investigate deep research chain it doesnt operate properly" + "make sure that web search and deep research chains must contain source links at the end of the facts/searched content(pill formatting)"

## Objective Reconstruction
Fix deep research chain issues: (1) search query was using raw conversational prompt instead of vision-extracted topic, (2) gap detection model call had OpenRouter provider routing bug, (3) gap detection was invisible in chain trace, (4) Tavily search results missing source link pills for frontend rendering.

## Strategic Reasoning
- Traced deepResearch.ts to find Round 1 Tavily search using raw user prompt ("imagine you are from prague...") which returned irrelevant travel articles instead of the real research topic (Czech digital consumer behavior)
- Found same openrouter_provider string-vs-object bug pattern (3rd occurrence in codebase)
- Gap detection had no visibility in chain trace; result was a string with no metadata
- Tavily result formatting lacked clickable pill links for frontend markdown renderer

## Operational Trace
Files modified:

### Source fixes
- `src/lib/bot/providers/deepResearch.ts` — Added `extractSearchQuery()` helper that parses `[VISION INSTRUCTIONS]` from vision_notes. Round 1 search uses the extracted research topic instead of raw prompt. Changed return type from string to `{ researchText, gapTrace }` object. Added gap trace metadata push. Fixed `runOpenRouter` call wrapping `openrouter_provider` in object.
- `src/lib/bot/chainRouter.ts` — Unpacks new `runDeepResearchChain` return type. Merges `gapTrace[]` into `routingTrace` so gap detection appears in chain trace.
- `src/lib/bot/providers/tavily.ts` — Added `[📄 {title}]({url})` pill link at end of each Tavily search result.
- `src/lib/bot/providers/deepResearch.ts` — Same pill formatting in internal Tavily search function.

### Pre-existing type fixes (blocked build)
- `src/app/admin/costs/actions.ts` — Added `: number` and `: any` type annotations to reduce callbacks.
- `src/app/admin/costs/CostCharts.tsx` — Changed `label: string` to `label: any` to match Recharts types.

## Status Assessment
Build passes, 36/36 tests pass. Deep research now: (1) searches the correct topic from vision instructions, (2) gap detection model calls respect OpenRouter provider routing, (3) gap detection appears in chain trace as `FAST_SIMPLE` entry, (4) all search results include clickable pill source links.
