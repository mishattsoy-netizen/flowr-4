User request: "why does classify shows 2 models succeeded if classifier can only use 1 succeeded model? and it shows improper order"

## Objective Reconstruction
Investigate and fix why the "API KEYS USED > classify" row in the Routing Dashboard shows 2 success markers (GROQ 1 ✓ and GEMINI 1 ✓) when only one classifier model should succeed, and why the order of pills looks incorrect.

## Strategic Reasoning
The ADVISOR step runs before the CLASSIFIER chain and its model (openai/gpt-oss-120b via Groq) is included as an entry in the raw `model_chain` string. The `LogsTable.tsx` parsing code slices the chain at the first KNOWN_CATEGORY token (e.g., MEDIUM_THINKING), grouping everything before it into `classifyTrace`. Since `advisor(pass):openai/gpt-oss-120b` appears before the classifier entries, it gets included in `classifyTrace` — producing an extra GROQ ✓ pill and making the order look wrong.

## Root Cause
**File:** `src/app/admin/logs/LogsTable.tsx` — lines 364–394

The `classifyTrace` was built from all chain parts before the CATEGORY separator without filtering out the `advisor(pass):*` prefix. The advisor is a separate pre-flight step — it should never appear in the "classify" key row.

## Detailed Blueprint
- Filter `classifyTrace` to exclude any entries where `part.toLowerCase().startsWith('advisor')`
- Filter `routingTrace` to exclude any entries where `part.toLowerCase().startsWith('classifier')` (defensive, unlikely but consistent)

## Operational Trace
- Edited `src/app/admin/logs/LogsTable.tsx` lines 364–394
- Added `.filter(part => !part.toLowerCase().startsWith('advisor'))` before `.map(...)` for `classifyTrace`
- Added `.filter(part => !part.toLowerCase().startsWith('classifier'))` before `.map(...)` for `routingTrace`
- Confirmed `FeedbackClient.tsx` uses `log.context_messages.classify` (stored `classificationTrace` from DB) which is already correct — no fix needed there

## Status Assessment
Fixed. The "classify" API KEYS USED row will now correctly show only the actual classifier model attempts (OpenRouter ✗, Groq ✗, Cloudflare ✗, Gemini ✓), without the advisor entry. The GROQ 1 ✓ will no longer appear falsely in the classify row.
