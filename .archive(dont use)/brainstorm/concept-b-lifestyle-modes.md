# Concept B — Lifestyle Modes

> **One-liner:** Tell Flowr who you are. It becomes the app you needed.

## Who this is for
Everyone who downloads Notion, stares at an empty page, and closes the tab.
Specifically: **traders, creators, students, freelancers, hobby-business founders, vibe coders.**

## Core idea
Flowr ships with a small number of **Modes** — opinionated, pre-assembled hubs tailored to a specific lifestyle. Picking a Mode configures the entire app: sidebar, default dashboard, block library, AI prompts, templates, analytics.

The user is **never dropped into a blank workspace**. They land in a working home that already looks like their life.

Modes are not themes — they change **what the app is for**.

## Launch Modes (6 to start)

### 1. Trader Mode
- Home: PnL dashboard, open positions, this-week trades, strategy vault
- Native blocks: Trade Entry (with screenshot), Strategy, Watchlist, Economic Calendar, Emotion Log, Review note
- Views: Trade journal (table + calendar heatmap), Equity curve, Tag analytics (win rate per setup)
- AI: "Review my losing trades this week", "What setup am I best at?", "Tag this screenshot"

### 2. Creator Mode (video / content)
- Home: Content pipeline (idea → script → record → edit → publish → stats)
- Native blocks: Idea, Script, Shot list, Thumbnail moodboard, Upload schedule, Channel stats
- Views: Content calendar, Kanban pipeline, Moodboard canvas
- AI: "Brainstorm 10 titles", "Write B-roll list from this script", "Retention hook ideas"

### 3. Student Mode
- Home: This-week classes, upcoming deadlines, recent notes
- Native blocks: Class note, Flashcard deck, Assignment, Exam countdown, Reading log
- Views: Semester calendar, Subject hubs, Spaced-repetition queue
- AI: "Summarize this lecture", "Quiz me", "Explain like I'm 15"

### 4. Freelancer Mode
- Home: Active clients, invoices due, this-week hours
- Native blocks: Client, Project, Task, Time entry, Invoice, Proposal, Portfolio piece
- Views: Client dashboard, Income tracker, Portfolio canvas
- AI: "Draft proposal for this client", "Summarize this week for this client"

### 5. Hobby-Business Mode (dropshipping / digital products)
- Home: Revenue, active products, marketing tasks
- Native blocks: Product, Supplier, Ad creative, Metric card, Experiment, Competitor
- Views: Product pipeline, Ad board (moodboard-style), Revenue tracker
- AI: "Write product description", "Analyze this ad's hook"

### 6. Life / Personal Mode
- Home: Today, habits, journal, goals
- Native blocks: Habit, Journal entry, Goal, Routine, Mood log, Book, Recipe
- Views: Habit grid, Journal timeline, Year-in-review
- AI: "Reflect on this week", "Summarize my journal entries this month"

Additional modes post-launch: Vibe Coder, Fitness, Wedding, Startup Founder, Researcher.

## Mode architecture

### What a Mode defines
- Default dashboard layout (widgets + order)
- Sidebar sections (what "areas" exist)
- Available block types + featured ones
- Starter templates and sample data
- AI persona + pre-built prompts
- Analytics / charts that matter to that lifestyle

### Multi-mode users
Users can enable **multiple Modes** simultaneously (e.g. Student + Trader). Each gets its own sidebar section. Data can cross-reference (a Trade mentioned in a Journal entry).

### Mode switcher
Top-left, prominent. Changes the primary dashboard context. Data stays, presentation changes.

## The AI agent's role
- **Mode-aware**: knows your active mode, tailors suggestions.
- **Setup agent**: on mode activation, asks 3-5 questions ("what do you trade?", "school year?") and populates realistic starter data.
- **Weekly agent**: auto-generates a "weekly review" page per mode (PnL review, content retro, study summary).
- **Voice to entry**: "Just closed EURUSD long +42 pips on the 4H breakout" → structured Trade Entry block.
- **Ask-anything**: scoped by mode, so "how did I do this week" means something specific.

## Why this beats Notion
- Zero cold-start. Notion's #1 churn cause eliminated.
- Specific > generic. "Notion, but for traders" is a marketable pitch; Notion can't respond without losing its identity.
- The app markets itself per niche (6 landing pages, 6 communities to target).
- AI is contextual, not generic.

## Why a user might still pick Notion
- They want a fully blank universal tool.
- They need unconventional structures Flowr doesn't template.
- Team wikis at scale.

## Fit with current Flowr code
- **Reuse:** tasks, tracker, canvas, workspace widgets, AI assistant.
- **Add:** Mode registry (JSON-ish config), mode switcher, per-mode default layouts, mode-specific block types (Trade, Habit, Client, etc.).
- **Refactor:** `WorkspaceRouter.tsx` reads active mode to render layout. `AIAssistant.tsx` takes mode context into system prompt.
- **Data:** existing entities table stays; add `mode` field to entities + a `modes` settings object per user.

## Risks
- Scope. 6 modes = 6 small apps to design. Mitigation: share ~80% of primitives (blocks, views), mode is thin config layer.
- Mode lock-in fear. Mitigation: modes are additive, not exclusive; data is portable.
- Mode feature parity envy (trader wants X, creator wants Y). Mitigation: ship a "Custom Mode" builder later.

## Monetization hooks
- Free: 1 mode, core blocks.
- Pro: unlimited modes, cloud sync, AI quota, advanced analytics per mode.
- Per-mode add-ons later (e.g. Trader Pro with broker integrations).

## What a phased plan would look like (preview)
1. Mode registry + mode switcher + default-layout engine (no new features yet).
2. Ship **Life Mode** first using existing primitives end-to-end.
3. Add Trader Mode (new block types: Trade Entry, Strategy, Watchlist; new charts).
4. Add Creator Mode (pipeline view, moodboard canvas block).
5. Add Student, Freelancer, Hobby-Business.
6. Mode-aware AI (system prompt injection + per-mode quick actions).
7. Multi-mode UX + cross-mode linking.
8. Analytics per mode + weekly-review auto-agent.
