# Concept D — Flow Blocks (Bento Dashboard)

> **One-liner:** Your life at a glance. No pages, no trees — just a bento of living blocks you arrange.

## Who this is for
- Dashboard lovers (people who like Apple Watch complications, iOS widgets, Grafana).
- Users who don't want to "open" anything — they want to see everything.
- Traders, habit-trackers, freelancers tracking KPIs, students tracking deadlines.

## Core idea
The home is a **bento grid** — a resizable, draggable dashboard of **blocks**. Each block is alive: it shows current data and often can be interacted with inline (check a habit, add a trade, jot a thought). The page tree is gone.

Think: **Apple iPad widget screen + Notion's blocks + Grafana's liveness**.

## Structure

### Levels
1. **Dashboards** — a named bento grid. User has a few (e.g. "Today", "Trading", "Clients", "School").
2. **Blocks** — the atomic unit inside a dashboard.
3. **Detail drawers** — clicking a block opens a focused detail panel from the right, never a new page.

No nesting beyond these three.

### Block library
Rich, focused, composable:

| Block | Interaction |
|---|---|
| Today's tasks | Check inline, add inline |
| Habit grid | Tap to mark today |
| Quick note | Type inline, commits to a capture log |
| Trade entry form | Inline form → adds to trade journal |
| PnL sparkline | Tap → detail |
| Calendar strip | Scroll, tap day |
| Moodboard strip | Horizontal image reel, tap to expand |
| Goal progress bar | Tap to log progress |
| Journal prompt | Writes into today's journal |
| Pomodoro / focus timer | Runs inline |
| AI briefing | Generated daily summary |
| Metric card | Any numeric KPI, user-defined |
| Countdown | Deadline / event |
| Recent files | Tap to open |
| Canvas preview | Click to expand canvas |

### Dashboards are not pages
They don't contain content, they **surface** content that lives in global object stores (tasks, trades, habits, notes, files). Move a task → it updates everywhere it appears. This is Flowr's equivalent of a database view, but always visual.

### The Inbox
A single global **capture log** where everything quick goes — voice notes, screenshots, pasted links, chat with AI. Agent later distributes items to proper places.

## The AI agent's role
- **Build my dashboard**: "Make me a trader's dashboard" → generates a bento.
- **Rearrange**: "Put PnL bigger", "Hide the habits block today."
- **Summarize**: "What's happening in my week?" → writes into the AI briefing block.
- **Triage the inbox**: "Process my inbox" → categorizes, creates trades/tasks/notes.

## Why this beats Notion
- Glanceability. Notion requires opening pages; Flowr surfaces without clicking.
- Friction is gone for micro-interactions (check a habit, log a trade) — which are 80% of daily use.
- Customization is visual (drag, resize), not database-config.
- Feels like a **device home screen**, not an office tool. Emotionally different.

## Why users might still pick Notion
- Long-form documents (novels, docs, wikis).
- Complex relational data beyond a single metric.
- Team wikis.

## Fit with current Flowr code
- **Reuse heavily:** `workspace/widgets/` is conceptually a bento. Promote and expand.
- **Reuse:** tasks, tracker, canvas (as a block type), AI assistant.
- **Add:** bento grid engine (drag + resize, save layout), block registry, global object stores decoupled from pages, capture inbox.
- **Refactor:** `WorkspaceRouter.tsx` → `DashboardRouter` with bento as primary view. Existing "pages" become detail drawers.
- **Data model:** decouple content (trade, task, habit) from containers. Pages today double as both; split them.

## Risks
- Users who want long-form writing feel under-served — need a "Docs" block or full-screen editor mode.
- Bento UX on mobile is tricky — need stacked single-column fallback.
- Hard to scale to truly team-wide use; this is a personal-first concept.

## Monetization hooks
- Free: 2 dashboards, 10 blocks each.
- Pro: unlimited dashboards + blocks, cloud sync, AI briefing, advanced block types.
- Power: premium blocks (broker integrations, analytics, automations).

## What a phased plan would look like (preview)
1. Bento grid engine (drag, resize, save) + block registry.
2. Migrate existing widgets to block format; deprecate old workspace.
3. New blocks: Habit grid, Trade entry, Goal, Countdown, Moodboard strip, AI briefing.
4. Capture inbox + global object stores for tasks/trades/habits/notes.
5. Dashboard templates (Trader, Student, Freelancer, Life).
6. Detail drawer system replacing page navigation.
7. Mobile stacked-column mode.
8. AI dashboard builder + inbox triage agent.
