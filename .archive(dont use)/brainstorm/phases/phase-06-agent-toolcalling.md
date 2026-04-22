# Phase 06 — AI Agent Tool-Calling

## 1. Request Summary

Upgrade the existing AI assistant from a chat-only surface into a **tool-using agent** that can create, update, and delete domain objects in the user's workspace via typed tool calls. Every destructive action is previewable + undoable. Every action shows up in a visible Action Log. The agent is **mode-aware** (system prompt + available tools depend on active modes) and **workspace-aware** (all mutations scoped to `activeWorkspaceId`).

---

## 2. Codebase Context

**Relevant files**
- `src/components/assistant/AIAssistant.tsx`
- `src/components/assistant/components/*`
- `src/app/api/openrouter/route.ts`, `src/app/api/gemini/route.ts`, `src/app/api/groq/route.ts` — existing model routes
- `src/data/store.ts` — has `sendAIMessage`, `tool_calls` in AIMessage type
- `src/data/store.types.ts` — already has `tool_calls`, `tool_call_id` fields in AIMessage
- Mode registries from phases 02, 03; calendar adapters from phase 04

**Architecture notes**
- Existing message type already supports tool call fields (`tool_calls`, `tool_call_id`, `name`). Infra half-exists — we formalize it.
- Tools are pure functions that map validated JSON input → store action invocations. No free-form SQL, no hallucinated fields.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Define tool schema types
- **File:** `src/agent/tools/types.ts` (create)
- **Action:** create
- **What to do:**
  ```ts
  export interface ToolDefinition<I = any, O = any> {
    name: string;
    description: string;
    inputSchema: JSONSchema;     // OpenAI-compatible
    destructive: boolean;         // true → requires preview + confirm
    requiresMode?: ModeId;        // available only when mode is active
    execute: (input: I, ctx: ToolContext) => Promise<ToolResult<O>>;
    preview?: (input: I, ctx: ToolContext) => ToolPreview; // for destructive
  }
  export interface ToolContext { workspaceId: string; activeModes: ModeId[]; store: AppStore; userId: string|null; }
  export type ToolResult<O> = { ok: true; data: O; undo?: () => Promise<void> } | { ok: false; error: string };
  export interface ToolPreview { summary: string; affected: { kind: string; id: string; label: string }[]; }
  ```
- **Why:** Single contract; validation, preview, undo, and mode-gating come free.

### Step 2 — Tool registry + loader
- **File:** `src/agent/tools/registry.ts` (create)
- **Action:** create
- **What to do:** `registerTool(def: ToolDefinition)` + `getToolsForContext(ctx)` that returns only tools whose `requiresMode` is in `ctx.activeModes` (or undefined). Export a `toolsToOpenAIFormat(tools)` helper that produces the `tools` array for the chat completion request.
- **Why:** Dynamic per-mode tool exposure; keeps system prompt context tight.

### Step 3 — Core workspace tools
- **File:** `src/agent/tools/core.ts` (create)
- **Action:** create
- **What to do:** Register:
  - `create_note(title, parentId?, content?)`
  - `update_note(id, patch)`
  - `delete_entity(id)` (destructive)
  - `create_task(title, dueDate?, scheduledAt?, modeId?)`
  - `update_task(id, patch)`
  - `complete_task(id)`
  - `create_calendar_event(title, scheduledAt, duration?, modeId?)`
  - `update_calendar_event(id, patch)`
  - `search_entities(query)`
  Each maps to existing store actions from phases 01/02/04.
- **Why:** Cross-mode primitives.

### Step 4 — Life mode tools
- **File:** `src/agent/tools/life.ts` (create)
- **Action:** create
- **What to do:** `check_habit`, `create_habit`, `log_mood(score, note?)`, `add_journal_entry(date, content)`, `create_goal`, `progress_goal`, `create_routine`, `toggle_routine_step`.
- **Why:** Agent can drive Life interactions end-to-end.

### Step 5 — Knowledge mode tools
- **File:** `src/agent/tools/knowledge.ts` (create)
- **Action:** create
- **What to do:** `create_topic`, `save_resource(url, topicId?)`, `create_snippet`, `create_guide`, `search_knowledge(query)`, `summarize_topic(topicId)`.
- **Why:** Second-brain ops.

### Step 6 — Tool stubs for modes 07–10
- **File:** `src/agent/tools/{trader,creator,student,hobby-business}.ts` (create, mostly stubs)
- **Action:** create
- **What to do:** Each file registers an empty-but-structured tool set. Phases 07–10 fill in. Keep placeholder tools like `create_trade_entry` that throw `{ ok:false, error:'not-implemented' }` — still valid to expose to AI so behavior is consistent.
- **Why:** Prevents later phases from touching agent infra.

### Step 7 — Action log slice + UI
- **File:** `src/agent/actionLog.ts` (create), `src/components/assistant/ActionLog.tsx` (create)
- **Action:** create
- **What to do:** Store slice holding last N (default 50) agent actions: `{id, toolName, input, result, timestamp, undone, undoFn?}`. UI renders as a collapsible panel inside AIAssistant showing each action with an Undo button when `undoFn` is present.
- **Why:** Trust + reversibility.

### Step 8 — Preview/confirm flow for destructive actions
- **File:** `src/components/assistant/ConfirmActionBanner.tsx` (create), wire into `AIAssistant.tsx`
- **Action:** create + modify
- **What to do:** When the agent returns a destructive tool call, don't auto-execute. Render a banner in the chat: summary + affected items + Confirm/Reject buttons. Only on Confirm does the tool `execute` run.
- **Why:** No surprise deletions.

### Step 9 — Agent runner
- **File:** `src/agent/runner.ts` (create)
- **Action:** create
- **What to do:**
  - Build messages: system prompt (composed from `MODE_REGISTRY[modeId].aiPersona` for every active mode + a base Flowr prompt) + chat history + user message.
  - Attach `tools` (from `getToolsForContext`).
  - Send request through the existing router (`sendAIMessage` infrastructure) to whichever model is selected.
  - Parse `tool_calls`; for each: validate input against `inputSchema` (use a light JSON Schema validator like `ajv` — add dep if not present, else custom minimal validator); execute or queue confirmation; push result as a `tool` role message; loop until the model returns a plain assistant message.
- **Why:** The orchestration core.

### Step 10 — System prompt composer
- **File:** `src/agent/systemPrompt.ts` (create)
- **Action:** create
- **What to do:** Build system prompt from:
  - Flowr base persona (1 paragraph).
  - Active modes' `aiPersona` strings.
  - Workspace name + active mode list.
  - Today's date + user TZ.
  - Brief "you have access to tools; prefer tools over prose when the user asks for actions" directive.
  - Safety rails: "Never fabricate IDs; search first."
- **Why:** Keeps prompts consistent + diff-able.

### Step 11 — Wire AIAssistant to runner
- **File:** `src/components/assistant/AIAssistant.tsx`
- **Action:** modify
- **What to do:** Replace the current direct-to-API send with `runAgent({ message, store, workspaceId, activeModes })`. Render tool_call and tool_result messages as compact inline chips (not raw JSON). Keep the current thinking indicator and model status.
- **Why:** Users see a smoother agent UX.

### Step 12 — Rate limiting + cost controls
- **File:** `src/agent/limits.ts` (create)
- **Action:** create
- **What to do:** Per-user soft caps: chat messages/day, tool executions/day. Track in localStorage for local users, in a `ai_usage` Supabase table for cloud users. Block when exceeded with a friendly message pointing to settings.
- **Why:** Beta cost guardrail.

### Step 13 — Cloud tracking table (beta)
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:**
  ```sql
  create table if not exists ai_usage (
    user_id uuid references auth.users(id),
    date    date not null default current_date,
    chat_count        integer default 0,
    tool_count        integer default 0,
    voice_seconds     integer default 0,
    primary key (user_id, date)
  );
  alter table ai_usage enable row level security;
  create policy "ai_usage: owner" on ai_usage for all
    using (user_id = auth.uid()) with check (user_id = auth.uid());
  ```
- **Why:** Cross-device limit tracking.

### Step 14 — Tests for tools
- **File:** `src/agent/tools/__tests__/core.test.ts` (create)
- **Action:** create
- **What to do:** Unit test a handful of core tools against a mocked store: `create_task`, `complete_task`, `delete_entity` + undo. Add `vitest` dev dep if not present.
- **Why:** Tool correctness is load-bearing; regressions silent.

### Step 15 — Devtools panel (hidden, dev only)
- **File:** `src/components/assistant/DevToolsPanel.tsx` (create, only rendered when `NODE_ENV !== 'production'`)
- **Action:** create
- **What to do:** List all registered tools, their schemas, and let devs invoke them directly for testing.
- **Why:** Speeds up agent iteration massively.

---

## 4. Verification Checklist

- [ ] Asking "create a habit called Drink water" produces a `create_habit` tool call; habit appears in Habit widget.
- [ ] Asking "delete all completed tasks" shows a preview banner; confirming executes; Undo restores them.
- [ ] Tools gated by inactive modes are not offered to the model (inspect system-prompt + tools payload).
- [ ] Rate limits trigger a soft cap with a clear UI message at the configured threshold.
- [ ] Action log shows every tool invocation with Undo where applicable.
- [ ] Switching workspace mid-conversation scopes new tool calls to the new workspace.
- [ ] `npm run build` passes; tests pass.

## 5. Notes & Warnings

- **Schema validation is non-negotiable.** Hallucinated fields must be rejected before reaching the store.
- Keep tool descriptions short and concrete — the model's tool-selection quality is sensitive to description wording.
- Do **not** expose tools that can wipe the workspace (e.g. "delete_workspace") in the agent-available set. Workspace-level destructive ops stay in the UI only.
- Preview/confirm adds friction — only gate true destructives (delete, bulk update). Single creates/updates run immediately.
- Undo is implemented via closure returned from `execute` — keep it cheap; prefer inverse operations over snapshot-diff for common cases.
- Cost: each round-trip with tool calls is multiple LLM calls. Route to cheap models (Haiku-class / Gemini Flash) for routine ops; escalate only on complex reasoning.
- Agent + shared workspaces: when phase 12 lands, tool executions in a shared workspace must respect per-member permissions. Plan the ctx extension now.
