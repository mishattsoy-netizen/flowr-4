# Memory Compaction Overhaul — Final Plan

## 1. Database Migration

**File:** `supabase/migrations/XXXXXX_compaction_chain.sql`

- Drop `draft_primary_model`, `draft_fallback_model`, `refine_primary_model`, `refine_fallback_model` from `bot_compaction_config`
- Insert `COMPACTION` chain into `router_chains` for platform `'app'` with default model + system prompt

## 2. Admin UI — Replace Draft/Refine with Compaction Chain Card

**Files:** `src/app/admin/bot/global/page.tsx`, `GlobalSettingsClient.tsx`

- Remove the two "Draft Step" / "Refine Step" cards
- Add a single card following the RouterManager pattern: model list (add/remove/enable), system prompt textarea, temperature input
- Save calls reuse existing router server actions: `updateRouterChain`, `updateRouterSystemPrompt`, `setRouterTemperature`

## 3. Backend — Rewrite `compactSession()`

**File:** `src/lib/bot/compaction.ts`

- Fetch COMPACTION chain via `getRouterChain('COMPACTION')`
- Build 3-part input: [system_prompt from admin] + [existing summary] + [raw history]
- Add provider switch (Google, Groq, OpenRouter) — remove hardcoded `runGoogle` only
- Run through model chain (primary → fallback chain), return result

## 4. chainRouter.ts Changes

**File:** `src/lib/bot/chainRouter.ts`

- **Pre-request compaction:** after fetching session state & history, if tokens exceed threshold and history has content, run compact before building prompt
- **History trimming:** when `currentSummary` exists, trim `historyForChain` to last 5 messages (raw messages beyond that are redundant with summary)
- **Session ID scoping:** use `chat:${activeChatId}` prefix when activeChatId is set, use `'temp'` for temp chats

## 5. Store Changes

**File:** `src/data/store.ts`

- `loadConversation`: call `fetchAISessionContext(id)` after loading
- `startTempChat`: set sessionId to isolate from other chats
- `clearAIChat`: already works correctly

## 6. Manual Compact Button Gating

**File:** `src/components/assistant/AIAssistant.tsx`

- Gate on: `isCompacting || messageCount < 5 || displayedTokens < contextLimit * 0.5`
- `messageCount` = filtered to user+assistant roles only

## 7. Temp Chat Save Button

**Files:** `src/components/chat/ChatConversation.tsx` or `src/components/assistant/AIAssistant.tsx`

- Add "Save Chat" button visible only when `isTempChat === true`
- On click: call `createConversation()` → re-insert all temp messages → set `activeChatId` + clear `isTempChat`
- New chat appears in history panel, temp highlights resolve
