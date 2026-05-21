# Phase 02 — Life Mode (end-to-end)

## 1. Request Summary

Ship the **Life / Personal Mode** as the first fully-implemented mode. Life mode is the default landing for every new user. It is focused on *doing* (not storing knowledge):
- **Habits** — daily streaks, tap-to-mark.
- **Mood log** — quick daily mood entry.
- **Journal** — daily journal with prompts.
- **Goals** — with progress.
- **Routines** — morning/evening/custom routines with checkable steps.
- **Planner / Schedule** — today's time blocks (fed into Global Calendar in phase 04).
- **Today overview** — aggregates tasks and routines from other active modes (full aggregation in phase 05; minimal version here).

Life mode proves the mode-as-config pattern end-to-end so later modes can be cloned with variations.

---

## 2. Codebase Context

**Relevant files**
- `src/modes/registry.ts` (created in phase 01) — fill in the `life` entry
- `src/components/modes/ModeHome.tsx` (phase 01)
- `src/components/workspace/widgets/*` — reuse bento widget system
- `src/data/store.ts`, `src/data/store.types.ts`
- `supabase/schema.sql`

**Dependencies**: existing canvas/tasks/widget system, Zustand persist, Supabase.

**Architecture notes**
- New domain objects (habit, mood entry, journal entry, goal, routine) live in **dedicated tables** rather than shoehorned into `entities`, because they're short/structured records, not documents.
- Each has a `workspace_id` and `mode_id = 'life'`.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Add Life domain types
- **File:** `src/modes/life/types.ts` (create)
- **Action:** create
- **What to do:** Export:
  ```ts
  export interface Habit { id, workspaceId, title, icon?, color?, frequency: 'daily'|'weekly'|'custom', schedule?: number[], createdAt }
  export interface HabitCheck { id, habitId, date: string /* YYYY-MM-DD */, done: boolean }
  export interface MoodEntry { id, workspaceId, date, score: 1..5, emoji?, note? }
  export interface JournalEntry { id, workspaceId, date, content: EditorBlock[], prompt?: string }
  export interface Goal { id, workspaceId, title, description?, targetValue?, currentValue?, unit?, dueDate?, status: 'active'|'done'|'archived' }
  export interface Routine { id, workspaceId, title, steps: { id, title, done?, order }[], schedule?: 'morning'|'evening'|'custom', createdAt }
  ```
- **Why:** Typed domain, self-contained per mode.

### Step 2 — Add Supabase tables for Life domain
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:** Append `habits`, `habit_checks`, `mood_entries`, `journal_entries`, `goals`, `routines` tables with `workspace_id text references workspaces(id) on delete cascade` and RLS policies "owner via workspace": `exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid())`.
- **Why:** Per-workspace scoping with RLS, ready for shared workspaces in phase 12.

### Step 3 — Store slices for Life domain
- **File:** `src/modes/life/store.ts` (create), `src/data/store.ts` (modify — import + include slice)
- **Action:** create + modify
- **What to do:** Create a Zustand slice with state + actions for each domain (`habits`, `moods`, `journals`, `goals`, `routines`), including `checkHabit(habitId, date)`, `uncheckHabit`, `setMood`, `upsertJournal(date, content)`, `progressGoal`, `toggleRoutineStep`. Persist via existing persist middleware.
- **Why:** Reactive state for Life widgets.

### Step 4 — Sync mappers for Life domain
- **File:** `src/lib/sync.ts`, `src/modes/life/sync.ts` (create)
- **Action:** create + modify
- **What to do:** Add row↔object mappers and `upsert*` / `delete*` / `load*` helpers per domain in `src/modes/life/sync.ts`. In `src/lib/sync.ts` call these from `loadFromSupabase` and add realtime channel subscriptions.
- **Why:** Cloud sync parity with entities/tasks.

### Step 5 — Habit grid widget
- **File:** `src/components/modes/life/widgets/HabitGridWidget.tsx` (create)
- **Action:** create
- **What to do:** Grid of the last 30–60 days × habits. Cell color = done/skipped. Tap today's cell to toggle via `checkHabit`. Header shows streak count. Click habit row → opens habit detail drawer.
- **Why:** Core Life-mode interaction.

### Step 6 — Mood tracker widget
- **File:** `src/components/modes/life/widgets/MoodWidget.tsx` (create)
- **Action:** create
- **What to do:** Today's mood emoji picker (1–5 with optional note). Below: 14-day mood sparkline. Stores via `setMood`.
- **Why:** Low-friction daily check-in.

### Step 7 — Journal widget
- **File:** `src/components/modes/life/widgets/JournalWidget.tsx` (create)
- **Action:** create
- **What to do:** Shows today's journal entry (or prompt + "Start writing"). Uses the existing note editor (`NotePage`'s block editor) in compact mode. Prompt rotates daily from a hard-coded list of 20.
- **Why:** Encourages daily use without friction.

### Step 8 — Goals widget
- **File:** `src/components/modes/life/widgets/GoalsWidget.tsx` (create)
- **Action:** create
- **What to do:** List of active goals with progress bar. Click → goal detail. "+" to create.
- **Why:** Long-horizon tracking.

### Step 9 — Routines widget
- **File:** `src/components/modes/life/widgets/RoutinesWidget.tsx` (create)
- **Action:** create
- **What to do:** Morning / Evening / Custom routine cards. Each routine shows its step list with checkboxes that reset daily (stored as `{routineId, date, stepId}` completions in a small table — add `routine_checks` to schema).
- **Why:** Habit-level structure above individual habits.

### Step 10 — Planner widget (minimal)
- **File:** `src/components/modes/life/widgets/PlannerWidget.tsx` (create)
- **Action:** create
- **What to do:** Today's time blocks in a simple vertical hour-strip. Each block = `{title, start, end, mode}`. Uses existing `tasks` table with `dueDate` + new `scheduled_at`/`duration` fields (added in phase 04's schema migration — stub here, finalize in phase 04).
- **Why:** Minimal schedule view; full calendar comes in phase 04.

### Step 11 — Today overview widget (minimal)
- **File:** `src/components/modes/life/widgets/TodayOverviewWidget.tsx` (create)
- **Action:** create
- **What to do:** List of today's tasks from all active modes in current workspace. Reuses `tasks` store. Groups by mode (icon chip). Tap → toggle complete. Phase 05 enhances this with routines + scheduled blocks.
- **Why:** First glimpse of cross-mode aggregation.

### Step 12 — Life Mode home layout
- **File:** `src/modes/registry.ts`
- **Action:** modify
- **What to do:** Fill `MODE_REGISTRY.life.defaultLayout` with a bento arrangement (e.g. Today overview top-left spanning 2 cols, Habit grid top-right, Mood + Journal middle row, Goals + Routines bottom, Planner right rail). Set `aiPersona: "You are a warm, supportive life assistant..."`. Add quick actions: "Log today's mood", "Add a habit", "New journal entry", "Review my week."
- **Why:** Mode config drives the home without hardcoding Life-specific branches in ModeHome.

### Step 13 — Widget registry extension
- **File:** `src/data/store.types.ts` (modify `WidgetType`), `src/components/workspace/widgets/index.ts` (create if missing)
- **Action:** modify
- **What to do:** Extend `WidgetType` union to include `'habit-grid'`, `'mood'`, `'journal'`, `'goals'`, `'routines'`, `'planner'`, `'today-overview'`. Create a widget registry file mapping `WidgetType → React component`. Update the widget renderer in `WorkspacePage.tsx` (or wherever widgets are dispatched) to use the registry.
- **Why:** Adding a widget type elsewhere becomes a one-line entry; no switch statements to edit.

### Step 14 — Life mode detail views (drawers)
- **File:** `src/components/modes/life/drawers/HabitDrawer.tsx`, `GoalDrawer.tsx`, `JournalDrawer.tsx` (create)
- **Action:** create
- **What to do:** Right-side slide-in panels for editing each domain object. Open via `openDrawer` state in store (add `drawer: {kind, id} | null` if not present).
- **Why:** Edits happen without leaving the dashboard.

### Step 15 — Seed starter data
- **File:** `src/modes/life/starter.ts` (create), `src/modes/registry.ts` (wire `starterEntities`)
- **Action:** create + modify
- **What to do:** `starterEntities()` returns 3 habits (e.g. "Drink water", "Read 10 min", "Walk"), 1 routine ("Morning routine" with 3 steps), 1 goal placeholder, today's journal prompt. Only seeded on **first mode activation**, never on re-activation.
- **Why:** Users see something useful immediately on activating Life mode.

---

## 4. Verification Checklist

- [ ] Activating Life mode on a fresh workspace seeds starter habits + routine + goal + journal prompt.
- [ ] Deactivating then re-activating Life mode does **not** re-seed (idempotent).
- [ ] All 7 widgets render without errors; each interaction (check habit, log mood, write journal, toggle routine step, progress goal) persists locally and syncs to Supabase.
- [ ] `Today overview` lists tasks from at least one other mode if present (use a manually-created task).
- [ ] Refreshing the page preserves all state.
- [ ] Mode remains functional with no internet (local-only users).
- [ ] `npm run build` passes.

## 5. Notes & Warnings

- Keep domain-specific tables thin — avoid JSON blobs for things you'll query (use real columns for `date`, `score`, `status`).
- Journal entry `content` is `EditorBlock[]` — reuse the existing editor, do not build a new one.
- When rendering habit streaks, cap the grid at 60 days to avoid rendering 365 cells on mobile.
- The Planner widget is **intentionally minimal** here — it becomes a real scheduler in phase 04. Do not over-build it now.
- Goal `currentValue` + `targetValue` allow both numeric goals ("read 12 books") and simple percentage. If no values, render as checkbox goal.
- Do not let widgets query the full tasks list without filtering by `workspaceId` — that is the biggest perf pitfall.
