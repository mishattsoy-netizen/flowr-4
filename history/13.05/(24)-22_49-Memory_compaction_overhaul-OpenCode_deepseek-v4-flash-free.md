User request: "lets work on memory compaction in chats right now"

## Objective Reconstruction
Overhaul the memory compaction system for AI chats:
1. Replace hardcoded Draft/Refine model config with a router chain (COMPACTION category)
2. History trimming when session summary exists (Claude Code-style: 5 recent msgs max)
3. Pre-request compaction check
4. Chat-scoped session isolation
5. Admin UI card for compaction chain (models, sys prompt, temp)
6. Manual compact gating (>=5 msgs, >=50% token usage)
7. Temp chat save button

## Strategic Reasoning
- Read all chat/memory/compaction code to understand the full data flow
- Identified that raw history AND session summary were both sent redundantly
- Found compaction ran after response (fire-and-forget), never before
- Session IDs could leak between chats via fallback chain
- Draft/Refine two-step was inflexible and hardcoded to Google models

## Operational Trace
Files created:
- `supabase/migrations/20260510_compaction_chain.sql` — drop old draft/refine cols, add COMPACTION chain
- `docs/plans/memory-compaction-final-plan.md`

Files modified:
- `src/lib/bot/compaction.ts` — rewrote compactSession() to use router chain with provider switch (Google/Groq/OpenRouter), removed hardcoded draft/refine model fields from CompactionConfig
- `src/lib/bot/chainRouter.ts` — 3 changes: (1) session ID scoping with `chat:` prefix + temp isolation, (2) pre-request compaction check, (3) history trimming to 5 msgs when summary exists
- `src/lib/router-config.ts` — added COMPACTION to IntentCategory type
- `src/data/store.types.ts` — added saveTempChat to AppState type
- `src/data/store.ts` — added saveTempChat store action
- `src/app/admin/bot/global/page.tsx` — fetches COMPACTION chain + temp for admin card
- `src/app/admin/bot/global/GlobalSettingsClient.tsx` — replaced Draft/Refine cards with Compaction Chain card (model list, system prompt, temperature)
- `src/components/assistant/AIAssistant.tsx` — gated manual compact button: >=5 messages AND >=50% token usage
- `src/components/chat/ChatPage.tsx` — added Save Chat button visible in temp chats

## Status Assessment
Complete. All 36 tests pass. No new type errors from changes (only pre-existing OrchestratorPanel issue). The system now works like Claude Code: when a session summary exists, raw history is trimmed to 5 messages, and compaction uses a configurable router chain with admin-configured system prompt, models, and temperature.
