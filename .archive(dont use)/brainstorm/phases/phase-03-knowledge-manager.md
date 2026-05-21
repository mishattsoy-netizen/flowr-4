# Phase 03 — Knowledge Manager Mode

## 1. Request Summary

Ship the **Knowledge Manager Mode** — a second-brain / library mode distinct from Life. No trackers, no streaks. Focused on *knowing*: long-lived reference material organized by topic, quickly findable, visually rich.

Primary surfaces:
- **Topics / Areas** — top-level buckets the user defines (e.g. "Philosophy", "React patterns", "Travel ideas", "Cooking").
- **Notes** — rich docs per topic (reuse existing editor).
- **Moodboards** — image grids per topic (reuse canvas).
- **Resources / Bookmarks** — saved links with preview.
- **Guides / Tutorials** — structured how-to entries with steps.
- **Snippets** — short reusable blobs (quotes, code, prompts).
- **Global search** — full-text across all Knowledge Manager content.
- **Tag index** — cross-topic browsing.

Validates the mode-as-config pattern for a non-tracker, document-heavy mode.

---

## 2. Codebase Context

**Relevant files**
- `src/modes/registry.ts`
- `src/components/modes/ModeHome.tsx`
- `src/components/editor/*` (existing rich-text editor — reuse)
- `src/components/canvas/*` (reuse for moodboards)
- `src/data/store.ts` (entities already support nested docs)
- `supabase/schema.sql`

**Architecture notes**
- Knowledge Manager **reuses the existing `entities` table** because its objects are docs, not structured records. We scope via `mode_id = 'knowledge'` and use `entity.type` for (note|canvas|folder|collection|mixed).
- New object types (resource, snippet, guide) that are not documents → dedicated small tables.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Define Knowledge Manager types
- **File:** `src/modes/knowledge/types.ts` (create)
- **Action:** create
- **What to do:**
  ```ts
  export interface Resource { id, workspaceId, title, url, description?, imageUrl?, tags: string[], topicId?: string, createdAt }
  export interface Snippet  { id, workspaceId, title?, body, lang?, tags: string[], topicId?: string, createdAt }
  export interface Guide    { id, workspaceId, title, steps: { id, title, body: EditorBlock[], order }[], topicId?: string, tags: string[] }
  ```
  Topics reuse `entity.type === 'folder'` with `mode_id = 'knowledge'`. Notes reuse `note`, moodboards reuse `canvas`.
- **Why:** Minimal new schema; leverage existing strong primitives.

### Step 2 — Add tables for non-document types
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:** Add `resources`, `snippets`, `guides` tables with `workspace_id`, `topic_id text references entities(id)`, RLS policy "owner via workspace."
- **Why:** Query-friendly storage for cards that aren't documents.

### Step 3 — Store slice
- **File:** `src/modes/knowledge/store.ts` (create), `src/data/store.ts` (wire)
- **Action:** create + modify
- **What to do:** State + CRUD for `resources`, `snippets`, `guides`. Selectors: `resourcesByTopic(topicId)`, `snippetsByTag(tag)`, `allKnowledgeTags()`.
- **Why:** Reactive, filterable lists.

### Step 4 — Sync layer
- **File:** `src/modes/knowledge/sync.ts`, `src/lib/sync.ts`
- **Action:** create + modify
- **What to do:** Row↔object mappers + upsert/delete/load. Hook into `loadFromSupabase` and realtime.
- **Why:** Cloud sync.

### Step 5 — Topic browser widget
- **File:** `src/components/modes/knowledge/widgets/TopicBrowserWidget.tsx` (create)
- **Action:** create
- **What to do:** Grid of topic cards (entity.folder). Each card: icon, title, item count, hero image (first resource's image if any). Click → opens topic view.
- **Why:** Entry point into the library.

### Step 6 — Topic view
- **File:** `src/components/modes/knowledge/TopicView.tsx` (create)
- **Action:** create
- **What to do:** Route rendered when a knowledge-topic entity is active. Shows: header, tabs [Notes | Moodboards | Resources | Snippets | Guides | All]. Content area lists the topic's items. Each tab uses a specialized list component.
- **Why:** One focused surface per topic, no deep nesting.

### Step 7 — Resource card + add-flow
- **File:** `src/components/modes/knowledge/ResourceCard.tsx`, `AddResourceModal.tsx` (create)
- **Action:** create
- **What to do:** Card shows image, title, domain, tags. Modal accepts a URL; attempts to fetch OG metadata via an API route `src/app/api/og-preview/route.ts` (create) that fetches and parses `<meta property="og:*">`. Fallback: user fills in manually.
- **Why:** One-paste bookmark capture.

### Step 8 — Snippet card + editor
- **File:** `src/components/modes/knowledge/SnippetCard.tsx`, `SnippetEditor.tsx` (create)
- **Action:** create
- **What to do:** Monospace code-style snippet with optional language. Copy-to-clipboard button. Inline edit.
- **Why:** Reusable small blobs.

### Step 9 — Guide editor
- **File:** `src/components/modes/knowledge/GuideEditor.tsx` (create)
- **Action:** create
- **What to do:** Step list; each step has a title + rich-text body using existing editor. Reorderable (dnd-kit already in project).
- **Why:** Structured how-tos distinct from freeform notes.

### Step 10 — Moodboard support
- **File:** none (reuse canvas)
- **Action:** none
- **What to do:** When user creates a moodboard inside a topic, create an entity `{type: 'canvas', modeId: 'knowledge', parentId: topicId}`. Preconfigure canvas with a media-heavy starter layout (grid of image-drop placeholders).
- **Why:** Zero new UI, canvas system does the work.

### Step 11 — Global search
- **File:** `src/components/modes/knowledge/KnowledgeSearch.tsx`, `src/modes/knowledge/search.ts` (create)
- **Action:** create
- **What to do:** Cmd+K–style modal scoped to Knowledge Manager. Searches across entity titles + EditorBlock content (client-side) + resources/snippets/guides. Highlights matches, groups by type. When cloud-backed, optionally call Supabase `ilike` queries for speed on large libraries.
- **Why:** Retrieval is the whole point of a second brain.

### Step 12 — Tag index
- **File:** `src/components/modes/knowledge/TagIndex.tsx` (create)
- **Action:** create
- **What to do:** Cloud/list of all tags used across Knowledge Manager with counts. Click a tag → filtered view of everything tagged.
- **Why:** Cross-topic navigation without nesting.

### Step 13 — Mode home layout
- **File:** `src/modes/registry.ts`
- **Action:** modify
- **What to do:** Fill `MODE_REGISTRY.knowledge.defaultLayout`: Topic browser (hero), recent notes, recent moodboards, tag cloud, search bar at top, "Add topic" CTA. `aiPersona: "You are a research and knowledge assistant..."`. Quick actions: "Save this link", "Start a new topic", "Find something I saved about …".
- **Why:** Config-driven home.

### Step 14 — Starter content
- **File:** `src/modes/knowledge/starter.ts`
- **Action:** create
- **What to do:** On first activation, seed 2 empty topics ("Inspiration", "To Read") and one "How to use Knowledge Manager" guide. Do not re-seed on re-activation.
- **Why:** Non-empty first impression.

### Step 15 — Wire into Mode registry + widget registry
- **File:** `src/modes/registry.ts`, widget registry from phase 02
- **Action:** modify
- **What to do:** Register new widget types: `'knowledge-topic-browser'`, `'knowledge-recent'`, `'knowledge-tags'`, `'knowledge-search'`. Map to components.
- **Why:** Mode home renders generically.

---

## 4. Verification Checklist

- [ ] Activating Knowledge Manager seeds 2 topics + 1 guide.
- [ ] Creating a topic, note, moodboard, resource, snippet, guide all work and persist.
- [ ] OG preview fetches correctly for a sample URL; fallback handles failures gracefully.
- [ ] Global search finds content across all 5 object types.
- [ ] Tag index updates live when tags are added/removed.
- [ ] Deactivating Knowledge Manager hides all its content from sidebar/search but preserves it on re-activation.
- [ ] Cloud sync round-trips resources/snippets/guides.
- [ ] `npm run build` passes.

## 5. Notes & Warnings

- **Do not let Knowledge Manager turn into Notion.** Resist nesting deeper than Topic → Items. If users want hierarchy beyond one level, they create sub-topics as sibling topics and link.
- OG fetch is a potential SSRF vector: the `/api/og-preview` route must validate the URL (no internal IPs, https only), enforce timeouts, and cap response size.
- Search over EditorBlock content is naive on large libraries — budget for Postgres full-text search in post-beta.
- Moodboards-as-canvases means existing canvas performance caveats apply (virtualize above ~100 blocks).
- Reuse `entity.tags` for topic and note tagging; no separate tag table needed.
- Don't add AI summarization here — that's phase 06's job via tool-calling.
