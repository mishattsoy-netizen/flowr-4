# Flowr — Final Concept: Lifestyle Modes (+ AI Agent + Custom Modes)

> Locked-in direction after brainstorm review. This file supersedes `concept-b-lifestyle-modes.md` for planning purposes.

---

## 1. Identity

Flowr is a **visual, lifestyle-templated personal hub with a built-in AI agent**.
You tell Flowr who you are (Trader, Student, Creator, etc.); it hands you a working hub you can extend by voice, text, or drag-drop.

**Wedge vs Notion:** zero cold-start, visual-first, opinionated per lifestyle, AI that actually sets things up and maintains them — not a blank canvas demanding setup.

---

## 2. Modes — core mechanics (LOCKED)

### 2.1 Modes are presets, not permanent furniture
- A Mode is **activated** on demand and **deactivated** freely.
- Inactive modes are **hidden** from sidebar, switcher, block library — the app doesn't nag users about a Trader mode they never wanted.
- Deactivating a mode does **not delete data**; it hides the mode's surface. Reactivation restores it instantly.
- Users can have multiple modes active simultaneously (e.g. Student + Trader).
- A user with zero active modes sees a **clean "pick a mode" empty state**, not a broken app.

### 2.2 Mode registry
Each mode is a config object, not hard-coded UI:
```
{
  id: "trader",
  name: "Trader",
  icon: ...,
  defaultBlocks: [...],
  defaultDashboardLayout: [...],
  blockTypes: ["trade-entry", "strategy", "watchlist", ...],
  aiPersona: "...",
  quickActions: [...],
  starterData: {...}
}
```
New modes = new config file. Keeps the core app small; modes are additive.

### 2.3 Mode switcher
Top-left, prominent. Quick toggle between **active** modes. Inactive modes sit behind an "Add mode" button that opens the mode library.

---

## 3. Beta scope — 6 modes (LOCKED)

| Mode | Positioning | Core blocks (beta) |
|---|---|---|
| **Life / Personal** | Default landing mode. Daily driver that aggregates from other modes. | Habits, Journal, Mood, Goals, Routines, Planner/Schedule, **Today overview (pulls tasks/routines from all other active modes)** |
| **Knowledge Manager** | Second brain / wiki. Not a tracker — a **library**. Ideas, notes, brainstorms, moodboards, resources, guides, tutorials, reference material on any topic. | Note, Topic/Area, Moodboard, Bookmark/Resource, Guide, Snippet, Collection, Tag index, Search |
| **Student** | School/university hub | Class note, Assignment, Flashcard, Exam countdown, Schedule, Reading log |
| **Trader** | Trading journal + analytics | Trade entry, Strategy, Watchlist, PnL, Emotion log, Economic calendar |
| **Creator** (broad) | Content creators across **video, IG, TikTok, YouTube, blogs** | Content idea, Script, Hook, Moodboard, Content calendar, Platform stats, Post pipeline |
| **Hobby-Business** | **Dropshipping + digital products + app/site launches** | Product, Supplier/Stack, Ad creative, Experiment, Revenue tracker, Launch checklist, Competitor |

### Life vs Knowledge Manager — why both
- **Life** = *doing*. Habits to check, mood to log, today's plan, routines, goals-in-progress. Aggregates tasks from other active modes into a unified "Today."
- **Knowledge Manager** = *knowing*. Long-lived reference material, not time-bound. No tracking, no streaks — just well-organized storage and retrieval. Images, PDFs, links, notes grouped by topic.

### Post-beta modes
- **Freelancer** (client/project/invoice oriented)
- **Custom Mode (AI-built, paid)** — see §5

---

## 4. AI Agent — always-on assistant (LOCKED)

### 4.1 Capabilities
- **Voice + text input** anywhere ("quick capture" shortcut + dedicated agent panel).
- **Mode-aware:** knows active modes, tailors system prompt + available tools.
- **Full read/write access** to workspace: create, edit, delete blocks, tasks, entries via **tool calls** (not raw DB).
- **Inline entry capture:** "Closed EURUSD long +42 pips, 4H breakout, felt calm" → structured Trade Entry.
- **Rearrange + extend:** "Add a weekly review section to my trading dashboard" → builds blocks.
- **Ask-anything:** "How did I trade this week?" "Summarize my Spanish class notes." "What habits did I skip?"
- **Proactive (post-beta):** weekly digest, overdue reminders, pattern surfacing.

### 4.2 Safety rails
- Every destructive action (delete, bulk edit) shows a **preview + undo** chip.
- An **agent action log** (collapsible) shows everything the AI changed.
- All agent mutations reach the DB only through a small, typed **tool schema** — no free-form SQL, no hallucinated fields.

### 4.3 Cost control for beta
- Soft daily caps (chat: generous, voice: moderate, agent tool calls: tight).
- Haiku/Gemini-Flash for classification + routine tasks; Sonnet/GPT-4-class for heavy reasoning.
- No image-gen, no TTS agents in beta (too expensive) — chat + voice STT only.

---

## 4bis. Workspaces — personal + collaborative (LOCKED)

Modes live **inside workspaces**. A user can belong to multiple workspaces and switch between them (top-level switcher, above the mode switcher).

### Workspace types

**Personal workspace** (default, free)
- One per user, private, only the owner sees it.
- All modes the user activates live here.
- This is the normal "my Flowr" experience.

**Shared workspace** (collaboration)
- Multi-user. Each member has their own seat inside the shared space.
- The **workspace creator** controls settings:
  - Which modes are **enabled** for the workspace (e.g. only Knowledge Manager + Student).
  - Which modes are **shared** (everyone sees the same data) vs **per-member** (each member has their own private instance of that mode inside the workspace).
  - Member roles: owner, editor, viewer.
  - Per-mode permissions (e.g. everyone can edit Knowledge Manager notes; only owner can edit the shared Hobby-Business product list).

### Example shared-workspace use cases
- **Study group**: shared Knowledge Manager + shared Student mode. Members co-own class notes, flashcards, assignment tracker.
- **Small team launching a hobby-business**: shared Hobby-Business mode (everyone sees revenue, products, ads) + per-member Life mode (each person's private tasks).
- **Friends starting a content channel together**: shared Creator mode (content calendar, shared scripts, shared moodboards) + per-member Life mode.
- **Friends planning trips/events**: shared Life mode for joint planning + per-member private Life for their own stuff elsewhere.

### Data model implications (high level)
- `workspaces` table with `owner_id`, `type` (personal/shared), `settings` JSON (enabled modes, per-mode sharing config).
- `workspace_members` table with `role`, per-mode permissions.
- Existing entities/tasks/notes gain a `workspace_id` + `scope` (shared | personal-within-shared).
- RLS rules in Supabase enforce per-workspace + per-member-scope visibility.

### Beta vs post-beta split
- **Beta:** personal workspace fully functional. Shared workspaces scaffolded (data model, invite flow) but limited to 2–3 members for testing.
- **Post-beta:** unlimited members, granular permissions, role management UI, activity feed.

---

## 4ter. Global Calendar — second sidebar pillar (LOCKED, beta)

A **Calendar** feature that sits in the sidebar **next to Modes**, as a first-class global surface (not scoped to one mode).

### Why global, not per-mode
- Users want **one pane of glass** for their time.
- Trades scheduled for tomorrow, a content post, an assignment deadline, a habit check-in, a journal entry — all time-bound things from all active modes aggregate here.

### Features (beta target — Notion-calendar parity)
- Views: **Day, Week, Month, Year**.
- Create/edit/delete events inline from the calendar.
- Drag-to-reschedule, drag-to-resize.
- **Filter by mode** (chips: Life, Trader, Student, Creator, Hobby-Business, Knowledge Manager — toggle visibility per mode).
- **Filter by type** (task, routine, scheduled plan, deadline, event).
- Click an event → opens the underlying block (a trade, a content post, an assignment) in its mode context.
- Quick-add: click any date → create event → pick a mode + type.
- AI agent tool: "schedule X for Thursday 3pm in Creator" → creates event via tool call.
- Keyboard shortcuts (j/k/h/l navigation, n for new event).
- Time-zone aware.

### Data model
- All scheduled/time-bound blocks (tasks with due dates, content posts, assignments, trade review events, habits, journal prompts) share a common `scheduled_at` field + `duration` + `mode` + `block_ref`.
- Calendar view = a query across all active modes' time-bound entities.
- No separate "calendar events" table needed — calendar is a lens over existing data. (Optionally add a `calendar_events` table for standalone events that don't belong to any mode.)

### Scope for beta
- All 4 views (day/week/month/year).
- Mode + type filters.
- Inline create/edit/delete + drag-reschedule.
- Workspace-aware (calendar respects current workspace; shows only modes enabled in it).
- Shared-workspace calendar overlay (post-beta): see teammates' shared events on the same calendar.

---

## 5. Custom Mode (post-beta, paid) (LOCKED)

A paid feature where the user describes their life/work, and the AI builds a fully functional custom mode for them.

**Flow:**
1. User clicks "Create Custom Mode" (Pro-gated).
2. Conversational setup: 5-10 questions about what they track, what they want to see, what they want to review weekly.
3. AI generates a full mode config: dashboard layout, block library selection, templates, AI persona.
4. User can **rename, edit, duplicate, share** the custom mode.
5. Optional: publish the mode to a **community mode marketplace** (post-launch, not beta).

This is one of the strongest monetization hooks and a natural upgrade trigger.

---

## 6. Mode Voting — community roadmap feature (LOCKED)

### Decision: Primary home = landing page. Entry point = in-app link.

- **Landing page**: `/modes/vote` public, SEO-friendly, indexable, shareable. Anyone can suggest modes + upvote others. Weekly voting cycles. Top suggestion each cycle → added to roadmap.
- **In-app**: small "Suggest a mode" card in the mode library. Deep-links to landing page voting. Preserves your personal-connection feel without duplicating a full voting UI.

**Why this split:**
- Landing gets SEO + reaches non-users (far bigger vote pool).
- Keeps app bundle smaller, voting data separate from user data.
- Personal connection preserved via launch posts, "You voted this one into existence" callouts, named credit when a mode ships.

---

## 7. Landing page / marketing site (LOCKED)

### Decision: Same Next.js project, different routes. No separate repo.

```
/                    → marketing home
/features
/pricing
/changelog           → auto from content/changelog/*.mdx
/faq                 → auto from content/faq/*.mdx
/modes/vote          → public voting
/contact
/terms  /privacy
/download            → PWA install instructions
/app                 → THE ACTUAL FLOWR APP (current code moves here)
```

### Why same repo
- One deploy, one domain, one auth session, one Supabase, one CI.
- Shared branding + components between marketing and app.
- Solo-dev friendly; zero extra infrastructure.

### Automated patch notes + FAQ
- Changelog = markdown files in `content/changelog/YYYY-MM-DD-slug.mdx` with frontmatter (version, date, type: feature/fix/improvement).
- Rendered statically at `/changelog` + via RSS feed.
- **In-app "What's new" popover** reads the same files — commit once, publishes everywhere.
- Same pattern for FAQ (`content/faq/*.mdx`) and legal docs.
- Graduate to a CMS (Sanity, Contentlayer) only when content ops outgrow markdown. Not needed for year one.

---

## 8. Monetization shape (for reference)

| Tier | Price | Includes |
|---|---|---|
| Free | $0 | 1 active mode, local storage, basic AI (soft caps), no voice agent |
| Pro | $9–12/mo | All 5 beta modes, cloud sync, generous AI, voice agent, weekly digests |
| Power | $19/mo | Custom Mode builder, premium models, advanced analytics, priority support |

Beta launches **free** with soft caps; Stripe + gating activated post-beta.

---

## 9. Fit with current Flowr code — high level

**Reuse:** `src/components/canvas/*`, `src/components/tasks/*`, `src/components/tracker/*`, `src/components/workspace/widgets/*`, existing AI assistant, Supabase sync in `src/lib/sync.ts`, Zustand store.

**New primary additions:**
- **Workspace model** (`workspaces`, `workspace_members` tables + RLS) with personal + shared types.
- Workspace switcher UI + shared-workspace invite flow.
- Mode registry + activation system (Zustand slice + Supabase `workspace_modes` table, scoped per workspace).
- Mode switcher UI + "Add mode" library + per-workspace mode-enablement settings.
- Per-mode block types (Trade Entry, Habit, Content Idea, Product, Class Note, Knowledge Note, Moodboard, Resource, etc.).
- Dashboard layout engine per mode (reuse widget infra).
- **Global Calendar** surface (sidebar, day/week/month/year, aggregates time-bound blocks across modes, mode + type filters).
- Agent tool-calling layer (typed tools over existing data ops, workspace + mode + calendar aware).
- Voice input (Web Speech API → STT → agent).
- Marketing routes + MDX content pipeline.
- Mode-voting backend (Supabase `mode_suggestions` + `mode_votes` tables) + landing page.

**Refactors:**
- `WorkspaceRouter.tsx` → mode-aware router.
- `AIAssistant.tsx` → mode-aware system prompt + tool-calling.
- Move current app under `/app` route; new `/` becomes marketing.

---

## 10. Risks + mitigations

| Risk | Mitigation |
|---|---|
| 5 modes = 5 mini-apps to design | ~80% shared primitives; Mode is thin config + 1-3 unique block types |
| Agent hallucinating destructive edits | Typed tool schemas, preview + undo, action log |
| AI cost in beta | Soft caps, small-model routing, no image-gen/TTS yet |
| Users confused by mode on/off paradigm | Default to **Life mode** active for everyone; onboarding hides complexity |
| Voting page becomes ghost town | Seed with 20 pre-written mode ideas; cross-promote in app |
| Marketing routes slow down app bundle | Static marketing routes + app behind `/app` route group with separate chunks |

---

## 11. Phased build — preview (not full plan yet)

High level, so you can see the shape before I expand it to a full file-level plan:

1. **Foundation** — workspace model (personal + scaffolded shared), mode registry, activation/deactivation, mode switcher, workspace switcher, migrate existing UI under `/app`.
2. **Life Mode end-to-end** — habits, mood, journal, goals, routines, planner. Proves the pattern.
3. **Knowledge Manager Mode** — notes, moodboards, resources, collections, search. Validates non-tracker mode shape.
4. **Global Calendar** — day/week/month/year views, inline CRUD, mode + type filters, drag-reschedule, time-zone aware. Lens over all time-bound data.
5. **Today overview in Life Mode** — aggregates tasks/routines from all other active modes.
6. **Agent tool-calling** — typed tools, preview + undo, action log. Mode-aware + calendar-aware system prompt.
7. **Trader Mode** — Trade Entry, Strategy, Watchlist, PnL chart.
8. **Creator Mode** — content pipeline, multi-platform posts, moodboard block.
9. **Student Mode** — class notes, flashcards, assignment/exam tracking.
10. **Hobby-Business Mode** — product pipeline, revenue tracker, launch checklist.
11. **Voice capture + voice agent**.
12. **Shared workspace beta** — invite flow, 2–3 member cap, per-mode sharing settings, RLS.
13. **Marketing routes** — `/`, `/pricing`, `/changelog`, `/faq`, `/contact`, `/modes/vote` with MDX pipeline.
14. **Mode voting backend + landing UI**.
15. **Beta polish** — onboarding, empty states, soft AI caps, PWA manifest.

**Post-beta:** Freelancer Mode, Custom Mode builder, Stripe + tiers, unlimited shared-workspace members + granular permissions, proactive agent digests, mode marketplace, shared-workspace calendar overlay.

---

## Ready to expand

Say the word ("expand to phased plan" or "start with phase 1") and I'll produce a file-level implementation plan — per-phase, with specific files to create/modify, code locations, verification checklists. Given the size, I'll likely split the full plan across multiple phase-files rather than one megafile.
