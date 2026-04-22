# Concept A — Visual Canvas OS

> **One-liner:** Flowr is a visual operating system for your life and work. The canvas isn't a feature — it's the home screen.

## Who this is for
- Graphic designers, illustrators, photographers, video editors
- Moodboard-thinkers: people who plan with images, arrows, groupings
- Creative freelancers who already use FigJam / Milanote / Figma for non-design work
- Anyone who finds Notion's text-wall oppressive

## Core idea
Every workspace is an **infinite, zoomable canvas**. Notes, tasks, trackers, habits, trade-journal entries, moodboards — all live as blocks on the canvas. The page-tree is replaced by **spatial memory**: you remember where things are, not what folder they're in.

Think: **Figma meets Notion meets Milanote**, but with real data inside the cards (not just pretty boxes).

## Structure

### Top-level: Boards
- A **Board** = one canvas (e.g. "Q2 Trading", "Client — Acme", "Freshman Year", "YouTube Channel").
- Boards appear in a left rail as small previews, not a nested tree.
- Max 2 levels deep: Boards → optional sub-boards. That's it. No rabbit holes.

### On the canvas: Typed blocks
Not generic shapes — every block has a **type** that gives it behavior:

| Block type | What it does |
|---|---|
| Note | Rich-text, markdown, embeds. Resizable. |
| Task / Task group | Checklist that also appears in the global Tasks view. |
| Tracker | Kanban / list / calendar, scoped to a Board or global. |
| Habit | Daily streak grid, taps to mark done. |
| Moodboard | Image grid with drag-rearrange, color palette extractor. |
| Trade entry | Structured card: pair, entry, exit, PnL, screenshot, notes. |
| Link / embed | URL preview, Figma, YouTube, Loom. |
| Connector | Arrow/line with label, connects two blocks. |
| AI block | Live AI-generated summary / answer anchored to the board. |
| File | PDF, image, video — previewable inline. |

### Navigation paradigm
- **Zoom out = overview.** Zoom in = detail.
- Mini-map in corner.
- **Command bar** (Cmd-K): fuzzy jump to any block across all boards.
- No breadcrumbs, no tree sidebar — just recent boards + pinned boards.

## The AI agent's role
- **"Draw for me"**: "Add a weekly trading review section" → agent lays out 5 blocks (trade list, PnL chart, reflection note, next-week plan, emotions tracker) in a sensible arrangement on the current canvas.
- **Summarize a zone**: Lasso-select a region, ask "summarize" → agent reads all blocks in that region and writes a summary block next to them.
- **Auto-organize**: "Clean up this board" → agent regroups, aligns, and labels clusters.
- **Content generation inside blocks**: same AI drafting you have today, but visually placed.

## Templates (critical — solves cold-start)
Ship ~8 starter boards users can stamp onto a new workspace:
- Trader Journal, Content Creator, Freelance Client Hub, Student Semester, Dropshipping Store, Vibe Coder Project, Wedding Planner, Life Dashboard.
Each = a pre-arranged canvas with filled example blocks the user edits/deletes.

## Why this beats Notion for the target user
- Designers think in space, not hierarchy.
- One glance → you see your whole life/project. No clicking through pages.
- Images are first-class, not awkward embeds.
- No slash-commands; everything is visible and draggable.

## Why users might still pick Notion
- Heavy structured-data work (true relational databases).
- Long-form writing (novels, docs, wikis).
- Large teams with permissions matrices.
→ Flowr doesn't try to win those. It wins the "my brain is visual" crowd.

## Fit with current Flowr code
- **Reuses heavily:** `src/components/canvas/*` already has CanvasBlock, connections, toolbar, layers. This is the biggest existing asset.
- **Promote:** canvas from "one workspace type" to the default home.
- **Repurpose:** existing `tracker/`, `tasks/`, `workspace/widgets/` → become canvas block types.
- **Refactor:** `WorkspaceRouter.tsx` swaps to `BoardRouter` with canvas as default.
- **Add:** block-type registry, board overview grid, command bar, mini-map.

## Risks
- Canvas UX is hard to nail on mobile. Need a dedicated mobile "list view" of the same board.
- Performance with 100+ blocks per board — need virtualization.
- "Blank canvas" fear for non-designers — templates solve this, but onboarding must push templates hard.

## Monetization hooks
- Free: 3 boards, 50 blocks each.
- Pro: unlimited boards, unlimited blocks, cloud sync, AI quota.
- Team: multi-cursor, comments, shared boards.

## What a phased plan would look like (preview)
1. Board model + board picker, deprecate old workspace types.
2. Block-type registry; migrate existing widgets to blocks.
3. New block types: Habit, Trade Entry, Moodboard, AI block.
4. Command bar + global search + mini-map.
5. Templates + onboarding flow.
6. Mobile list-view fallback.
7. AI agent canvas-aware actions ("draw for me", lasso-summarize).
8. Collaboration (cursors, comments).
