# Phase 05 — Today Overview Aggregation

## 1. Request Summary

Upgrade the minimal Today Overview widget from phase 02 into a real cross-mode aggregation surface. It must show **everything due or scheduled today** from every active mode in the current workspace — tasks, scheduled items, routine steps due, habits pending, calendar events, upcoming deadlines — in one glanceable, interactive list.

This is the core daily-use surface for Life mode and the anti-Notion pitch: one place to see "what matters today" without opening anything.

---

## 2. Codebase Context

**Relevant files**
- `src/components/modes/life/widgets/TodayOverviewWidget.tsx` (phase 02 minimal version)
- `src/modes/calendar/selectors.ts` (phase 04) — reuse `selectCalendarItems`
- `src/modes/life/store.ts` — habits, routines
- `src/data/store.ts` — tasks
- Per-mode calendar adapters registered in phase 04

**Dependencies**: none new.

**Architecture notes**
- We already have a unified `CalendarItem` type from phase 04. Today Overview is essentially `selectCalendarItems(today-start, today-end)` + habits pending today + routines pending today, grouped and sorted smart.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Today selector
- **File:** `src/modes/life/selectors.ts` (create)
- **Action:** create
- **What to do:** Export `selectTodayItems(state): TodayItem[]` where:
  ```ts
  type TodayItem =
    | { kind: 'calendar'; item: CalendarItem }
    | { kind: 'habit'; habit: Habit; done: boolean }
    | { kind: 'routine'; routine: Routine; pendingSteps: number }
    | { kind: 'overdue'; task: AppTask };
  ```
  Collect: calendar items from today, habits not yet checked today, routines with pending steps, tasks with `dueDate === today` or overdue and not complete.
- **Why:** Single source for the widget and for agent queries.

### Step 2 — Grouping + sorting
- **File:** `src/modes/life/selectors.ts`
- **Action:** modify
- **What to do:** Add `groupTodayItems(items)` that returns ordered sections: `[Morning, Afternoon, Evening, Anytime, Overdue]` based on `scheduledAt` hour (or `anytime` when unscheduled). Within each section sort by time then by mode priority (user-configurable later; default order: Life, Student, Trader, Creator, Hobby-Business, Knowledge).
- **Why:** Readable stream, not a wall of items.

### Step 3 — Upgrade TodayOverviewWidget
- **File:** `src/components/modes/life/widgets/TodayOverviewWidget.tsx`
- **Action:** modify
- **What to do:** Replace minimal task list with section-grouped rendering of `selectTodayItems` + `groupTodayItems`. Each row:
  - Mode icon (color-coded chip)
  - Time (if scheduled) or source tag
  - Title
  - Inline action: check/toggle (task, habit, routine step)
  - Tap → detail drawer or navigate to underlying block
- **Why:** Interactive, glanceable.

### Step 4 — Row components
- **File:** `src/components/modes/life/widgets/today/*.tsx` (create folder): `CalendarRow.tsx`, `HabitRow.tsx`, `RoutineRow.tsx`, `OverdueRow.tsx`
- **Action:** create
- **What to do:** One component per `TodayItem.kind`. Consistent visual rhythm.
- **Why:** Keeps the main widget lean.

### Step 5 — Empty state + AI suggestion
- **File:** `src/components/modes/life/widgets/TodayOverviewWidget.tsx`
- **Action:** modify
- **What to do:** When list is empty: show friendly copy + "Ask AI to plan my day" button that prefills the AI assistant with a prompt `"Plan a productive day for me based on my active modes and this week's goals."` (real tool execution wired in phase 06).
- **Why:** Zero-state doesn't dead-end.

### Step 6 — Smart "Now" marker
- **File:** same
- **Action:** modify
- **What to do:** Horizontal rule inserted at the current time position. Updates every minute via an interval effect.
- **Why:** Immediate sense of what's next.

### Step 7 — Quick capture input
- **File:** `src/components/modes/life/widgets/today/QuickCapture.tsx` (create)
- **Action:** create
- **What to do:** Inline input at top of widget: "What's on your mind?". Enter creates a quick task (no mode, goes to Life inbox). Slash-prefix (`/trade …`, `/note …`, `/idea …`) routes to that mode — map to mode-specific quick-create functions (each mode registers one in phase 07–10).
- **Why:** Lowest-friction capture, visible on daily-home.

### Step 8 — Week preview strip
- **File:** `src/components/modes/life/widgets/today/WeekStrip.tsx` (create)
- **Action:** create
- **What to do:** Tiny 7-day horizontal strip above Today's list. Each day shows dot-density indicating item count. Click a day → navigates to that day's calendar view.
- **Why:** Context without leaving home.

### Step 9 — Persistence of user ordering (optional)
- **File:** `src/modes/life/store.ts`
- **Action:** modify
- **What to do:** Allow user to drag rows within the "Anytime" section to reorder; persist as `todayOrder: string[]` on workspace settings.
- **Why:** Power users want control; low cost with dnd-kit already in project.

### Step 10 — Agent handles
- **File:** `src/modes/life/selectors.ts`
- **Action:** modify
- **What to do:** Export stable serialized shape `serializeTodayForAgent(state)` returning JSON-safe array for phase 06's agent tools to read as context.
- **Why:** Agent and UI read the same truth.

---

## 4. Verification Checklist

- [ ] Creating a task with `dueDate: today` in any active mode shows it in Today Overview.
- [ ] Scheduled calendar events appear at the right time section.
- [ ] Unchecked habits appear; checking one removes it from the list instantly.
- [ ] Routine rows show "X of Y steps" and expand to show the steps.
- [ ] Overdue section shows stale incomplete tasks.
- [ ] "Now" marker renders at the correct time and advances.
- [ ] Quick capture: plain text → task; `/trade eurusd long` → routes to trader (post phase 07 stub).
- [ ] Changing active modes updates the list without reload.
- [ ] `npm run build` passes.

## 5. Notes & Warnings

- This widget will be queried often — memoize selectors aggressively.
- Pitfall: habit streaks depend on checks for **today** in user TZ, not UTC — reuse `userTz()` helper from phase 04.
- The quick-capture slash-command dispatcher is a pattern reused by phase 11 (voice). Keep it in a pure function consumable by both.
- Don't fetch from Supabase directly here — everything reads from Zustand; sync is a separate concern.
