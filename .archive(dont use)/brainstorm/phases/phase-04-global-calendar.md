# Phase 04 — Global Calendar

## 1. Request Summary

Add a **Global Calendar** as a second sidebar pillar (next to Modes). It aggregates every time-bound item across every active mode in the current workspace and offers Notion-calendar-parity UX: day / week / month / year views, inline CRUD, drag-reschedule, filters by mode and type, time-zone aware.

The calendar is a **lens** over existing data — no new event container. Anything with a `scheduledAt` shows up. Standalone events (not tied to any mode) live in a new `calendar_events` table.

---

## 2. Codebase Context

**Relevant files**
- `src/components/layout/Sidebar.tsx` — add Calendar entry
- `src/components/WorkspaceRouter.tsx` — route new `activeEntityId === 'calendar'` case
- `src/data/store.ts`, `store.types.ts`
- `src/lib/sync.ts`
- `supabase/schema.sql`
- `src/modes/life/widgets/PlannerWidget.tsx` (phase 02) — starts feeding calendar

**Dependencies**: `date-fns` (add; not yet in deps), existing dnd-kit.

**Architecture notes**
- Every mode's time-bound object (trade, content post, assignment, habit check, journal entry, task) gains `scheduledAt?: string (ISO)` + `duration?: number (minutes)`.
- Calendar queries a union: tasks + calendar_events + mode-specific objects that expose `scheduledAt`.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Add `date-fns` dependency
- **File:** `package.json`
- **Action:** modify
- **What to do:** `npm install date-fns date-fns-tz`. Commit lockfile.
- **Why:** Robust, tree-shakeable date math + time-zone support.

### Step 2 — Add scheduling fields to existing tables
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:**
  ```sql
  alter table tasks add column if not exists scheduled_at timestamptz;
  alter table tasks add column if not exists duration_minutes integer;
  alter table tasks add column if not exists time_zone text; -- IANA
  -- for mode-specific time-bound objects, same fields get added when those tables are created.

  create table if not exists calendar_events (
    id              text primary key,
    workspace_id    text not null references workspaces(id) on delete cascade,
    title           text not null,
    description     text,
    scheduled_at    timestamptz not null,
    duration_minutes integer not null default 60,
    time_zone       text,
    color           text,
    mode_id         text,      -- nullable: standalone events
    block_ref       text,      -- optional reference to a domain object
    created_at      timestamptz not null default now()
  );
  create index if not exists calendar_events_workspace_idx on calendar_events(workspace_id);
  create index if not exists calendar_events_scheduled_idx on calendar_events(scheduled_at);
  alter table calendar_events enable row level security;
  create policy "calendar_events: owner via workspace"
    on calendar_events for all
    using (exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()))
    with check (exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
  ```
- **Why:** Uniform scheduling contract + a home for ad-hoc events.

### Step 3 — Update AppTask type
- **File:** `src/data/store.types.ts`
- **Action:** modify
- **What to do:** Extend `AppTask`:
  ```ts
  scheduledAt?: string;
  durationMinutes?: number;
  timeZone?: string;
  modeId?: ModeId;
  ```
- **Why:** Tasks participate in calendar.

### Step 4 — Define CalendarEvent + unified CalendarItem
- **File:** `src/modes/calendar/types.ts` (create)
- **Action:** create
- **What to do:**
  ```ts
  export interface CalendarEvent { id, workspaceId, title, description?, scheduledAt, durationMinutes, timeZone?, color?, modeId?, blockRef? }
  export type CalendarItemSource = 'task'|'event'|'trade'|'content-post'|'assignment'|'habit-check'|'journal'|'routine';
  export interface CalendarItem {
    id: string;
    source: CalendarItemSource;
    modeId?: ModeId;
    title: string;
    scheduledAt: string;
    endAt: string;
    color?: string;
    refId: string;  // id of the underlying object
  }
  ```
- **Why:** A single shape the calendar UI renders; adapters translate per source.

### Step 5 — Calendar store slice
- **File:** `src/modes/calendar/store.ts` (create), `src/data/store.ts` (wire)
- **Action:** create + modify
- **What to do:** State: `calendarEvents: CalendarEvent[]`, `calendarFilters: { modes: Set<ModeId>; sources: Set<CalendarItemSource> }`, `calendarView: 'day'|'week'|'month'|'year'`, `calendarCursor: string (ISO date)`. Actions: `createEvent`, `updateEvent`, `deleteEvent`, `rescheduleItem(item, newStart)`, `setCalendarView`, `setCalendarCursor`, `toggleFilterMode`, `toggleFilterSource`.
- **Why:** Reactive calendar UI.

### Step 6 — Unified calendar selector
- **File:** `src/modes/calendar/selectors.ts` (create)
- **Action:** create
- **What to do:** Export `selectCalendarItems(state, rangeStart, rangeEnd): CalendarItem[]` that merges:
  - `tasks` with `scheduledAt` in range
  - `calendarEvents` in range
  - per-mode adapters (registered via `registerCalendarSource(modeId, adapterFn)`)
  Respects filters. Memoize via Zustand `shallow` or reselect-style pattern.
- **Why:** One selector all views share; modes register sources in their own files.

### Step 7 — Calendar sync
- **File:** `src/modes/calendar/sync.ts`, `src/lib/sync.ts`
- **Action:** create + modify
- **What to do:** Mappers + upsert/delete/load for `calendar_events`. Realtime channel. Update task mappers to include new fields.
- **Why:** Cloud parity.

### Step 8 — Calendar page shell + routing
- **File:** `src/components/calendar/CalendarPage.tsx` (create), `src/components/WorkspaceRouter.tsx` (modify)
- **Action:** create + modify
- **What to do:** Add `if (activeEntityId === 'calendar') return <CalendarPage />`. `CalendarPage` renders: header (view switcher, cursor controls, filter chips, "+ Event"), main area (one of 4 view components).
- **Why:** Enter the calendar from sidebar.

### Step 9 — Month view
- **File:** `src/components/calendar/MonthView.tsx` (create)
- **Action:** create
- **What to do:** 6-row × 7-col grid. Each day cell shows up to N items (overflow → "+3 more" popover). Drag item between cells to reschedule. Click empty cell → quick-add popover. Click item → detail drawer.
- **Why:** Primary overview.

### Step 10 — Week view
- **File:** `src/components/calendar/WeekView.tsx` (create)
- **Action:** create
- **What to do:** 7-col × 24-row time grid. Drag vertically to resize (change `durationMinutes`); drag horizontally to reschedule. All-day strip at top.
- **Why:** Primary planning surface.

### Step 11 — Day view
- **File:** `src/components/calendar/DayView.tsx` (create)
- **Action:** create
- **What to do:** Single-column 24-hour strip with time slots. Same drag-to-reschedule / resize behavior.
- **Why:** Focused today's-schedule surface.

### Step 12 — Year view
- **File:** `src/components/calendar/YearView.tsx` (create)
- **Action:** create
- **What to do:** 12-month mini-calendar grid. Cell intensity = density of items that day. Click a day → jumps to day view.
- **Why:** Long-range overview + quick jumps.

### Step 13 — Filter bar + mode chips
- **File:** `src/components/calendar/FilterBar.tsx` (create)
- **Action:** create
- **What to do:** Chips for each active mode (color-coded) + source types. Click to toggle. "Only today / only this week" shortcuts.
- **Why:** Signal-to-noise control.

### Step 14 — Quick-add + detail drawer
- **File:** `src/components/calendar/QuickAddPopover.tsx`, `EventDrawer.tsx` (create)
- **Action:** create
- **What to do:** Quick-add: title + date/time + mode dropdown → creates `calendar_event` or (if mode chosen) the matching mode-specific object via a mode-provided `createScheduledItem` hook. Drawer edits all fields.
- **Why:** CRUD without leaving the calendar.

### Step 15 — Sidebar entry
- **File:** `src/components/layout/Sidebar.tsx`
- **Action:** modify
- **What to do:** Add a top-level "Calendar" item below workspace switcher, above modes. Active when `activeEntityId === 'calendar'`.
- **Why:** Calendar is a second pillar.

### Step 16 — Register mode adapters (bootstrap)
- **File:** `src/modes/life/calendar.ts`, `src/modes/knowledge/calendar.ts` (create, mostly no-op for knowledge)
- **Action:** create
- **What to do:** Each mode exports a `calendarAdapter` registered on boot. Life: exposes routine instances + scheduled habits + journal-prompt reminders. Knowledge: no-op (no time-bound content).
- **Why:** Pattern ready for phase 07–10 modes to plug in.

### Step 17 — Time zone handling
- **File:** `src/modes/calendar/tz.ts` (create)
- **Action:** create
- **What to do:** Utility functions: `userTz()`, `toUserLocal(iso)`, `fromUserLocal(date)`. Every rendered time runs through these. Store always holds UTC ISO.
- **Why:** Travelers and shared workspaces across zones.

---

## 4. Verification Checklist

- [ ] Creating a task with `scheduledAt` shows it in all relevant calendar views.
- [ ] Dragging an event to a new date updates `scheduledAt`.
- [ ] Resizing an event updates `durationMinutes`.
- [ ] Mode filter chips correctly show/hide items.
- [ ] Switching between day/week/month/year preserves cursor position logically.
- [ ] Standalone `calendar_event` can be created and edited.
- [ ] Deleting an event removes it everywhere without breaking other items.
- [ ] Cloud sync + realtime reflect calendar changes across tabs within 2s.
- [ ] Time-zone: changing OS TZ does not duplicate events.
- [ ] `npm run build` passes.

## 5. Notes & Warnings

- Drag-to-reschedule performance: throttle updates; commit on drop, not on every pixel.
- Large month views with hundreds of items: paginate via "+N more."
- Recurring events (weekly habits) should **not** be expanded into individual rows in DB — compute occurrences on the fly in selector.
- All schedule fields must be stored UTC; rendering converts to user TZ.
- Don't couple calendar CRUD directly to mode tables — use the registered adapter pattern so modes stay swappable.
- The Planner widget from phase 02 becomes a compact day-view of the calendar — refactor it to reuse `DayView` internals if possible; otherwise acceptable to keep separate but match visuals.
