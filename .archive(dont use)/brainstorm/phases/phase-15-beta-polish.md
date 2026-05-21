# Phase 15 — Beta Polish

## 1. Request Summary

Final pass before opening beta signups. Onboarding, empty states, soft AI caps, PWA manifest check, perf pass, error surfaces, telemetry, legal, and a launch checklist.

---

## 2. Codebase Context
- All prior phases landed
- Supabase tables + RLS hardened in phase 12

## 3. Step-by-Step Implementation Plan

### Step 1 — Onboarding flow
- **File:** `src/components/onboarding/OnboardingWizard.tsx`, `src/app/app/onboarding/page.tsx` (create)
- **Action:** create
- **What to do:** 4-step wizard for first-time users:
  1. Welcome + workspace name.
  2. Pick modes (multi-select grid with descriptions). Defaults to Life.
  3. Optional: answer 3 per-mode setup questions (e.g. trader: "What do you trade?"). Used by agent to seed starter data.
  4. Preview → "Open Flowr." Runs `starterEntities()` for each selected mode.

### Step 2 — Empty states per view
- **File:** every mode's home + calendar + knowledge search + tracker
- **Action:** modify
- **What to do:** Every zero-state has friendly copy + 1 action button. No dead-ends.

### Step 3 — Error boundaries + toasts
- **File:** `src/components/feedback/ErrorBoundary.tsx`, `Toast.tsx` (create)
- **Action:** create
- **What to do:** App-wide React error boundary that reports to console + telemetry. Toast system for sync errors, tool-call failures, quota warnings.

### Step 4 — Soft AI caps UX
- **File:** `src/components/assistant/UsageMeter.tsx` (create), wire limits from phase 06
- **Action:** create
- **What to do:** Visible meter in AIAssistant header. When approaching cap: warn. When over: graceful message + link to settings.

### Step 5 — Performance audit
- **File:** various
- **Action:** modify
- **What to do:**
  - Virtualize lists > 50 items (calendar month cells, trade log, content pipeline).
  - Lazy-load per-mode bundles via dynamic import — inactive modes shouldn't ship their code.
  - Memoize selectors (calendar, today, knowledge search).
  - Audit re-renders with React devtools.

### Step 6 — PWA polish
- **File:** `public/manifest.json`, `public/sw.js`, icons in `public/icons/`
- **Action:** modify
- **What to do:** Full icon set (maskable), theme color, splash screens for iOS. Service worker: network-first, offline shell for `/app` with a "you are offline" banner.

### Step 7 — Telemetry (privacy-first)
- **File:** `src/lib/telemetry.ts` (create)
- **Action:** create
- **What to do:** Track anonymous events: mode_activated, agent_tool_executed, workspace_created, error. No PII. Pluggable provider (Plausible or self-hosted PostHog).

### Step 8 — Settings cleanup
- **File:** existing settings modal
- **Action:** modify
- **What to do:** Verify all sections (Profile, Interface, Account, AI, Workspaces, Shared Workspaces, Notifications, Usage) are present and render correctly. Prune dev-only entries.

### Step 9 — Feedback channel
- **File:** `src/components/feedback/FeedbackButton.tsx` (create)
- **Action:** create
- **What to do:** Persistent button bottom-right. Opens a mini form → submits to `/api/feedback` which emails owner + logs to Supabase `feedback` table.

### Step 10 — Legal + account deletion
- **File:** legal MDX, `src/app/api/account/delete/route.ts` (create)
- **Action:** create + modify
- **What to do:** Implement account deletion (GDPR): cascades via DB foreign keys. Terms + Privacy finalized (consult real template, not AI-generated boilerplate before launch).

### Step 11 — Launch checklist doc
- **File:** `LAUNCH-CHECKLIST.md` (create, project root)
- **Action:** create
- **What to do:** Pre-launch: Lighthouse pass, accessibility pass (keyboard + screen reader basics), Supabase RLS audit, cost projections verified, waitlist list ready, Product Hunt draft, Twitter thread draft, subreddit list, demo video, "upgrade path" note in changelog.

### Step 12 — Beta invite codes
- **File:** `src/app/api/beta/claim-code/route.ts`, `supabase` `beta_codes` table
- **Action:** create
- **What to do:** Generate codes owner distributes. Signup requires valid code until lifted. Lets you throttle onboarding + measure channel conversion.

### Step 13 — Accessibility pass
- **File:** various UI
- **Action:** modify
- **What to do:** Keyboard nav across sidebar, calendar, mode switcher. ARIA labels on all icon buttons. Color-contrast audit. Focus rings not suppressed.

### Step 14 — Error recovery
- **File:** `src/lib/sync.ts`
- **Action:** modify
- **What to do:** Exponential backoff on sync failures. Local queue for offline writes, flushed on reconnect.

### Step 15 — Final smoke test
- **File:** `scripts/smoke-test.md` (create)
- **Action:** create
- **What to do:** Manual checklist of 40 flows covering every mode + calendar + agent + shared workspace + voting page. Any red blocks beta.

---

## 4. Verification Checklist
- [ ] New user goes through onboarding → lands in configured workspace with seeded data.
- [ ] Offline: app still opens; reads cached data; shows offline banner.
- [ ] PWA installable on iOS + Android + Desktop.
- [ ] Soft AI cap triggers cleanly, user can reset/upgrade.
- [ ] Account deletion removes all user data from all tables.
- [ ] Lighthouse: perf ≥ 85, a11y ≥ 95, best-practices ≥ 95, SEO ≥ 95.
- [ ] RLS audit: two-user manual test confirms no data leakage.
- [ ] Launch checklist complete with signoffs.

## 5. Notes & Warnings
- Don't skip real a11y — screen-reader pass catches 80% of issues.
- Terms + Privacy: **do not ship AI-generated legal**; get a human review.
- Telemetry: only collect what you'll actually use. PII-free is a feature, not a missed opportunity.
- Beta codes aren't about scarcity theater — they're a backpressure valve while you watch quotas.
- Budget time for unexpected issues: realistically, this phase always takes 2x longer than planned. Schedule accordingly.
