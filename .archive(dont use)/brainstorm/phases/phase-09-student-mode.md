# Phase 09 — Student Mode

## 1. Request Summary

Ship Student Mode: a school/university hub. Core surfaces: classes (courses), class notes, assignments, exams with countdowns, flashcard decks with spaced repetition, reading log, semester calendar.

---

## 2. Codebase Context
- `src/modes/registry.ts`, `src/agent/tools/student.ts`
- `src/modes/calendar/selectors.ts`
- `supabase/schema.sql`
- Existing note editor, tracker

## 3. Step-by-Step Implementation Plan

### Step 1 — Types
- **File:** `src/modes/student/types.ts`
- **Action:** create
- **What to do:**
  ```ts
  export interface Class { id, workspaceId, name, code?, color?, teacher?, schedule?: { day: number, startHour, endHour }[], semester?: string }
  export interface Assignment { id, workspaceId, classId, title, description?, dueDate, status: 'todo'|'in-progress'|'done', weight?: number, gradeEarned?: number, gradeMax?: number }
  export interface Exam { id, workspaceId, classId, title, date: string, duration?, location?, topics: string[] }
  export interface FlashcardDeck { id, workspaceId, classId?, name, cardCount: number }
  export interface Flashcard { id, deckId, front, back, ease: number, interval: number, dueDate: string, lapses: number }
  export interface ReadingLogEntry { id, workspaceId, classId?, title, author?, pagesRead?, dateRead, notes? }
  ```

### Step 2 — Supabase tables
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:** `classes`, `assignments`, `exams`, `flashcard_decks`, `flashcards`, `reading_log`; `workspace_id`, `mode_id`, RLS.

### Step 3 — Store + sync
- **File:** `src/modes/student/store.ts`, `sync.ts`
- **Action:** create
- **What to do:** CRUD + selectors `upcomingAssignments`, `upcomingExams`, `dueFlashcards`, `classesOnDay(date)`.

### Step 4 — Class hub
- **File:** `src/components/modes/student/ClassHub.tsx`, `ClassDrawer.tsx`
- **Action:** create
- **What to do:** Grid of class cards with color; click opens drawer: tabs Notes | Assignments | Exams | Flashcards | Readings.

### Step 5 — Assignment tracker
- **File:** `src/components/modes/student/AssignmentTracker.tsx`
- **Action:** create
- **What to do:** List + Kanban toggle. Reuses existing `KanbanColumn`. Overdue highlighted red.

### Step 6 — Exam countdown widget
- **File:** `src/components/modes/student/widgets/ExamCountdownWidget.tsx`
- **Action:** create
- **What to do:** Next 3 exams with live days-remaining counter.

### Step 7 — Flashcards + spaced repetition
- **File:** `src/components/modes/student/flashcards/{DeckView,ReviewSession}.tsx`, `src/modes/student/sr.ts` (create)
- **Action:** create
- **What to do:** SM-2 algorithm (simple, battle-tested):
  ```ts
  function grade(card, q /*0..5*/) {
    if (q < 3) { card.interval = 1; card.lapses++; }
    else {
      card.ease = Math.max(1.3, card.ease + 0.1 - (5-q)*(0.08 + (5-q)*0.02));
      card.interval = card.interval === 0 ? 1 : card.interval === 1 ? 6 : Math.round(card.interval * card.ease);
    }
    card.dueDate = addDays(today, card.interval);
  }
  ```
  ReviewSession shows due cards one by one with Again/Hard/Good/Easy buttons.

### Step 8 — Reading log
- **File:** `src/components/modes/student/ReadingLog.tsx`
- **Action:** create
- **What to do:** Simple entries; aggregate pages/min per week.

### Step 9 — Class schedule widget
- **File:** `src/components/modes/student/widgets/ClassScheduleWidget.tsx`
- **Action:** create
- **What to do:** This-week class blocks (M-F, hour grid).

### Step 10 — Calendar adapter
- **File:** `src/modes/student/calendar.ts`
- **Action:** create
- **What to do:** Expose assignments (due dates), exams, recurring class sessions → `CalendarItem`s.

### Step 11 — Mode home + starter
- **File:** `src/modes/registry.ts`, `src/modes/student/starter.ts`
- **Action:** modify + create
- **What to do:** Home: Upcoming assignments + exams, This-week schedule, Due flashcards, Class grid. Starter seeds 1 example class ("Math 101") with an example assignment + a 5-card deck.

### Step 12 — Agent tools
- **File:** `src/agent/tools/student.ts`
- **Action:** modify
- **What to do:** `create_class`, `create_assignment`, `log_grade`, `create_flashcard_deck`, `generate_flashcards_from_note(entityId, count)`, `summarize_note(entityId)`, `quiz_me(deckId)`.

---

## 4. Verification Checklist
- [ ] Create class → assignment attached → shows in calendar + upcoming.
- [ ] Exam countdown updates daily.
- [ ] Flashcard review: Again resets interval; Good extends per SM-2.
- [ ] "Generate flashcards from this note" creates N cards.
- [ ] Class schedule shows recurring blocks correctly.

## 5. Notes & Warnings
- SR algorithm: start with SM-2; FSRS (newer) is better but heavier. Upgrade post-beta.
- Don't hard-code a semester calendar — user-driven dates only.
- Grade calculation UI is easy to get wrong with weighted categories; keep beta simple (weight per assignment), formalize later.
