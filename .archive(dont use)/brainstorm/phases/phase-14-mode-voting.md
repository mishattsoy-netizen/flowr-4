# Phase 14 — Mode Voting (Community Roadmap)

## 1. Request Summary

Build the public **Mode Voting** feature. Lives primarily at `/modes/vote` on the marketing site. Users suggest new modes + upvote others. Weekly cycles — top suggestion wins the next dev slot. In-app entry point links out.

Requires auth-lite (email + optional OAuth) for submitting/voting to prevent spam. Browsing is public.

---

## 2. Codebase Context
- Marketing routes from phase 13
- Supabase auth + tables
- Landing site layout

## 3. Step-by-Step Implementation Plan

### Step 1 — Tables
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:**
  ```sql
  create table if not exists mode_suggestions (
    id           uuid primary key default gen_random_uuid(),
    title        text not null,
    description  text not null,
    use_cases    text[],
    submitted_by uuid references auth.users(id) on delete set null,
    submitted_at timestamptz not null default now(),
    cycle        text not null default to_char(now(), 'IYYY-"W"IW'),
    status       text not null default 'open', -- 'open'|'winner'|'shipped'|'rejected'
    shipped_version text
  );
  create table if not exists mode_votes (
    suggestion_id uuid references mode_suggestions(id) on delete cascade,
    user_id       uuid references auth.users(id) on delete cascade,
    cycle         text not null,
    voted_at      timestamptz not null default now(),
    primary key (suggestion_id, user_id, cycle)
  );
  alter table mode_suggestions enable row level security;
  alter table mode_votes enable row level security;
  create policy "suggestions: public read" on mode_suggestions for select using (true);
  create policy "suggestions: auth insert" on mode_suggestions for insert with check (auth.uid() is not null);
  create policy "votes: public read" on mode_votes for select using (true);
  create policy "votes: auth insert" on mode_votes for insert with check (auth.uid() is not null and user_id = auth.uid());
  create policy "votes: auth delete" on mode_votes for delete using (auth.uid() = user_id);
  ```

### Step 2 — Vote API route
- **File:** `src/app/api/modes/vote/route.ts` (create)
- **Action:** create
- **What to do:** POST `{suggestion_id}` → upsert vote for current cycle. DELETE to unvote. Enforce one vote per user per cycle per suggestion.

### Step 3 — Suggest API route
- **File:** `src/app/api/modes/suggest/route.ts` (create)
- **Action:** create
- **What to do:** POST `{title, description, use_cases[]}`. Validates length (title ≤ 80, description ≤ 800). Profanity filter (simple wordlist). Rate limit: 3 suggestions per user per week.

### Step 4 — Suggestions list page
- **File:** `src/app/(marketing)/modes/vote/page.tsx`
- **Action:** create
- **What to do:** SSR: fetch current-cycle suggestions ordered by vote count desc. Render cards: title, description, use cases, vote count, "Vote" / "Voted" button (requires auth). "Suggest a mode" CTA.

### Step 5 — Suggest modal
- **File:** `src/app/(marketing)/modes/vote/_components/SuggestModal.tsx`
- **Action:** create
- **What to do:** Modal form; calls `/api/modes/suggest`. Preview pane shows how the suggestion will render.

### Step 6 — Cycle logic
- **File:** `src/lib/modes/cycles.ts` (create)
- **Action:** create
- **What to do:** Helpers: `currentCycle() -> "2026-W16"`, `cycleDateRange(cycle)`, `isCycleClosed(cycle)`. Voting closes at UTC Sunday 23:59.

### Step 7 — Cron: cycle close + winner
- **File:** `src/app/api/modes/close-cycle/route.ts` (create) + Vercel cron config
- **Action:** create
- **What to do:** Runs Monday 00:15 UTC. Picks top suggestion for the previous cycle, sets `status='winner'`. Sends email to site owner with winner details.

### Step 8 — Roadmap / past cycles page
- **File:** `src/app/(marketing)/modes/vote/history/page.tsx`
- **Action:** create
- **What to do:** Past cycles with winner + runner-up + shipped version link.

### Step 9 — In-app entry point
- **File:** `src/components/modals/ModeLibraryModal.tsx`
- **Action:** modify
- **What to do:** Bottom of modal: "Don't see the mode you want? → Suggest + vote on modes." Link opens `/modes/vote` in new tab.

### Step 10 — Email-gate for voting
- **File:** marketing auth setup
- **Action:** modify
- **What to do:** Unauthenticated users see vote buttons but clicking opens a minimal magic-link sign-in (Supabase auth, email-only). Post sign-in, vote registers automatically.

### Step 11 — Moderation dashboard (admin)
- **File:** `src/app/(marketing)/admin/mode-suggestions/page.tsx`
- **Action:** create
- **What to do:** Owner-only (hardcoded email match or `is_admin` claim). Review / reject suggestions. Toggle winner / shipped status. Edit if needed.

### Step 12 — Seed 10 starter suggestions
- **File:** `supabase/seed-mode-suggestions.sql` (create)
- **Action:** create
- **What to do:** Insert 10 compelling starter mode ideas so the page isn't empty at launch (Fitness, Wedding, Researcher, Founder, Parent, Gamer, Language Learner, Habit Coach, Mental Health, Home Management).

---

## 4. Verification Checklist
- [ ] Public browsing works without auth.
- [ ] Voting requires auth; enforces one-per-cycle.
- [ ] Suggest form validates + rate-limits.
- [ ] Cron closes cycle and marks winner.
- [ ] In-app link reaches `/modes/vote`.
- [ ] Mobile responsive.
- [ ] Suggestions are rank-stable when reloaded.

## 5. Notes & Warnings
- Avoid vote manipulation: email-gate minimum, possibly require email verification before vote counts.
- Don't let voting determine priority absolutely — mark it "community roadmap" and keep owner veto via moderation.
- Email winner notification to yourself goes to high-signal inbox, not noise.
- SEO: every suggestion page is indexable — good for marketing; make slugs readable.
