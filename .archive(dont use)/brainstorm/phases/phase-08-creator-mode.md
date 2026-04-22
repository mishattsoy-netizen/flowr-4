# Phase 08 — Creator Mode

## 1. Request Summary

Ship Creator Mode for **multi-platform content creators** (video, IG, TikTok, YouTube, blogs). Core surfaces: content pipeline (idea → script → shoot → edit → publish → review), content calendar, multi-platform post records, moodboard blocks, script editor, hook bank, platform stats.

---

## 2. Codebase Context

**Relevant**
- `src/modes/registry.ts`, `src/agent/tools/creator.ts`
- `src/components/canvas/*` (for moodboards)
- `src/components/tracker/*` (Kanban → content pipeline)
- `src/modes/calendar/selectors.ts`
- `supabase/schema.sql`

**Architecture notes**
- Content pipeline reuses existing Kanban tracker with custom column set.
- Platform-specific fields are stored as a JSON blob on a single `content_pieces` table rather than per-platform tables.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Domain types
- **File:** `src/modes/creator/types.ts`
- **Action:** create
- **What to do:**
  ```ts
  export type Platform = 'youtube'|'instagram'|'tiktok'|'blog'|'twitter'|'linkedin'|'other';
  export type ContentStage = 'idea'|'script'|'shoot'|'edit'|'scheduled'|'published'|'reviewed';
  export interface ContentPiece {
    id, workspaceId, title,
    platforms: Platform[],
    stage: ContentStage,
    scheduledAt?: string,
    publishedAt?: string,
    scriptEntityId?: string,
    moodboardEntityId?: string,
    hooks: string[],
    assets: { url, kind, caption? }[],
    metrics?: Partial<Record<Platform, { views?, likes?, comments?, saves?, retention? }>>,
    tags: string[],
  }
  export interface Hook { id, workspaceId, body, platform?, tags: string[], usedCount: number }
  ```

### Step 2 — Supabase tables
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:** `content_pieces`, `hooks` tables; `workspace_id`, `mode_id`, RLS.

### Step 3 — Store + sync
- **File:** `src/modes/creator/store.ts`, `sync.ts`
- **Action:** create
- **What to do:** CRUD + selectors `piecesByStage`, `piecesByPlatform`, `upcomingScheduled`.

### Step 4 — Content pipeline view (Kanban)
- **File:** `src/components/modes/creator/ContentPipeline.tsx`
- **Action:** create
- **What to do:** Reuse `KanbanColumn.tsx`; columns = `ContentStage`. Drag card between columns → updates `stage`. Card shows platform icons + title + thumbnail.

### Step 5 — Content piece detail drawer
- **File:** `src/components/modes/creator/ContentDrawer.tsx`
- **Action:** create
- **What to do:** Tabs: Overview | Script | Moodboard | Assets | Metrics. Script tab embeds note editor. Moodboard tab embeds canvas. Metrics tab = simple per-platform form (users manually enter post-publish numbers in beta).

### Step 6 — Hook bank widget
- **File:** `src/components/modes/creator/widgets/HookBankWidget.tsx`
- **Action:** create
- **What to do:** List of hooks, searchable, taggable. "Use hook" copies to clipboard + increments `usedCount`. Agent tool `generate_hooks(platform, topic)` fills this.

### Step 7 — Platform filters + per-platform view
- **File:** `src/components/modes/creator/PlatformFilter.tsx`
- **Action:** create
- **What to do:** Chip row to toggle platforms. Applies to pipeline + calendar.

### Step 8 — Script editor (light wrapper on note editor)
- **File:** `src/components/modes/creator/ScriptEditor.tsx`
- **Action:** create
- **What to do:** Uses existing block editor but adds markers for [HOOK], [BODY], [CTA]. Word count + est. reading time per section. Section headers are styled.

### Step 9 — Moodboard integration
- **File:** none (reuse canvas)
- **Action:** reuse
- **What to do:** On content piece creation, optionally create linked canvas entity with moodboard starter layout.

### Step 10 — Calendar adapter
- **File:** `src/modes/creator/calendar.ts`
- **Action:** create
- **What to do:** Expose `scheduledAt` from content pieces as `CalendarItem source: 'content-post'` with platform color coding.

### Step 11 — Mode home + starter
- **File:** `src/modes/registry.ts`, `src/modes/creator/starter.ts`
- **Action:** modify + create
- **What to do:** Home: Pipeline (big), this-week publish calendar, Hook bank, Recent metrics. Starter seeds 3 idea cards in pipeline + 5 sample hooks + 1 example moodboard.

### Step 12 — Agent tools
- **File:** `src/agent/tools/creator.ts`
- **Action:** modify
- **What to do:** `create_content_piece`, `advance_stage`, `schedule_post`, `generate_hooks(platform, topic, count)`, `draft_script(piece_id, outline)`, `summarize_week_performance`.

### Step 13 — Quick-capture
- **File:** integration in `QuickCapture.tsx`
- **Action:** modify
- **What to do:** `/idea …` creates an idea-stage content piece.

---

## 4. Verification Checklist
- [ ] Drag card across pipeline updates stage + persists.
- [ ] Schedule a piece → appears on Global Calendar with platform color.
- [ ] Hook bank: add, search, use (copy), increment count.
- [ ] Agent: "Generate 10 TikTok hooks about productivity" → fills hook bank.
- [ ] Platform filter narrows pipeline correctly.
- [ ] Deactivating Creator hides everything.

## 5. Notes & Warnings
- Don't hard-code platforms — users will want to add niche ones. Store as string; UI treats known platforms specially for icons/colors only.
- Metrics input is manual in beta; post-beta plug into YouTube/IG Graph APIs (auth cost + scope).
- Script editor must not fork the core editor — wrap it.
- Don't add thumbnails upload here — reuse existing media flow from canvas.
