# Flowr 3.2 AI — Full App Description for AI Agent

> This document is the authoritative reference for an AI agent assisting with the global redesign and feature expansion of Flowr. It describes the current state of the codebase, every working feature, all UI/UX patterns, the data model, and the design system. Do not guess — use this file as ground truth.

---

## 1. What Is Flowr

Flowr is a **visual-first, AI-powered productivity and knowledge workspace** — a personal operating system for thoughts, notes, tasks, and ideas. It sits at the intersection of Notion (structured content), Figma (visual canvas), and a fully embedded AI assistant. The target user is someone who thinks visually and wants everything in one place: notes, databases, freeform canvases, tasks, and AI — all connected.

The app runs as a **Next.js 15 App Router** application, deployed as a web app. State is managed with **Zustand + persist** (localStorage). An optional **Supabase** backend can sync entities and tasks across devices in real time. The AI stack is multi-provider and entirely serverless via Next.js API routes (edge runtime).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| State | Zustand with `persist` middleware (localStorage) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Animations | GSAP (page transitions, modals) |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` (editor blocks) |
| Database/Sync | Supabase (optional; entities + tasks tables) |
| AI Providers | OpenRouter, Google Gemini (AI Studio), Groq, local Ollama |
| Image Generation | Pollinations.ai, Puter.js |
| Fonts | Inter (UI), Fira Mono (code), Playfair Display (serif) |
| Icons | Lucide React |

---

## 3. Data Model

### 3.1 Entity

The fundamental unit of content. Every item in the sidebar is an `Entity`.

```ts
interface Entity {
  id: string;
  title: string;
  type: EntityType; // 'collection' | 'folder' | 'note' | 'canvas' | 'mixed'
  parentId: string | null; // null = top-level
  lastModified: number; // Unix timestamp
  icon?: string; // icon key (from icons.ts registry)
  tags?: string[];
  content?: EditorBlock[]; // only for 'note' and 'mixed' types
}
```

Entity hierarchy: `collection > folder > note/canvas/mixed`. Collections and folders can be nested. Notes, canvases, and mixed pages are leaf nodes (though they can be placed inside folders or at root level).

### 3.2 EditorBlock

The atomic unit of editor content. Every line/element in a note is a block.

```ts
interface EditorBlock {
  id: string;
  type: BlockType;
  content: string; // HTML string for rich text
  style?: BlockStyle; // 'title' | 'heading' | 'subheading' | 'body' | 'mono'
  checked?: boolean; // checklist only
  columnCount?: number; // columns container
  children?: EditorBlock[]; // columns children, section children
  embedEntityId?: string;
  embedDisplayMode?: 'list-item' | 'widget-sm' | 'widget-md' | 'widget-lg';
  dbViewType?: 'table' | 'board' | 'gallery' | 'list';
  dbColumns?: DatabaseColumn[];
  dbRows?: DatabaseRow[];
  dbGroupByColumnId?: string; // board view
  tableData?: string[][]; // simple table (rows × cols)
  align?: 'left' | 'center' | 'right' | 'justify';
  mediaUrl?: string;
  mediaWidth?: 1 | 2 | 3 | 4; // 25% / 50% / 75% / 100%
  mediaCaption?: string;
  textColor?: string;
  bgColor?: string;
  pinned?: boolean;
  // Canvas-specific
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  canvasId?: string;
  parentId?: string; // canvas section membership
  zIndex?: number;
  shapeType?: 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'line' | 'arrow';
  canvasStyle?: { fill?: string; stroke?: string; opacity?: number; cornerRadius?: number; };
  fromId?: string; // connection source
  toId?: string;   // connection target
  fromSide?: 'top' | 'right' | 'bottom' | 'left';
  toSide?: 'top' | 'right' | 'bottom' | 'left';
}
```

All block types: `text`, `checklist`, `bulletList`, `dashedList`, `numberedList`, `quote`, `divider`, `columns`, `column`, `embed`, `database`, `table`, `image`, `video`, `shape`, `section`, `comment`, `connection`.

### 3.3 AppTask

```ts
interface AppTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // YYYY-MM-DD
  entityId?: string | null; // linked to a page
  note?: string;
  color?: string;
  difficulty?: number;
  createdAt?: number;
}
```

### 3.4 Zustand Store (AppState) — key fields

```
entities: Entity[]           — all pages, folders, collections
tasks: AppTask[]             — all tasks (global + page-linked)
blocks: EditorBlock[]        — canvas blocks (separate from entity content)
activeEntityId               — currently open page ID (or 'dashboard')
favoriteIds: string[]
collapsedIds: string[]       — sidebar collapse state
theme: 'dark' | 'light'
interfaceSize: 'small' | 'regular' | 'big'
appStyle: 'v1' | 'v2'       — two visual themes
isSidebarCollapsed
isSidebarPinned
isToolbarVisible
mixedLayoutSplit: number     — split ratio for mixed pages
isFullWidth: boolean         — content width toggle
navigationHistory: string[]  — breadcrumb-style back/forward
historyIndex: number
aiMessages: AIMessage[]
aiModel: string
aiRuntime: 'cloud' | 'local'
isAIAssistantOpen
isAIAssistantExtended        — sidebar vs floating mode
```

---

## 4. Application Structure

```
src/
├── app/
│   ├── layout.tsx           — root layout, fonts, SupabaseProvider
│   ├── page.tsx             — mounts Shell + WorkspaceRouter
│   ├── globals.css          — design tokens, Tailwind config
│   └── api/
│       ├── openrouter/      — OpenRouter proxy (edge)
│       ├── gemini/          — Gemini AI Studio proxy (edge)
│       ├── groq/            — Groq proxy (edge)
│       ├── local/           — local Ollama proxy
│       └── search/          — (placeholder)
├── components/
│   ├── layout/
│   │   ├── Shell.tsx        — root layout wrapper (sidebar + header + main + AI panel)
│   │   ├── Sidebar.tsx      — left navigation panel
│   │   ├── HeaderBar.tsx    — top bar with nav, actions, breadcrumb
│   │   ├── TreeItem.tsx     — recursive sidebar tree node
│   │   ├── ContextMenu.tsx  — right-click context menu
│   │   ├── Tooltip.tsx      — hover tooltip
│   │   ├── IconPicker.tsx   — icon selection modal
│   │   ├── PathPicker.tsx   — move-to path picker
│   │   ├── Portal.tsx       — React portal for overlays
│   │   └── SmoothScroll.tsx — global smooth scroll
│   ├── editor/
│   │   ├── NoteEditor.tsx   — main block editor (dnd-kit sortable)
│   │   ├── BlockRenderer.tsx — renders individual blocks
│   │   ├── BlockOptionsMenu.tsx — per-block floating options
│   │   ├── EditorToolbar.tsx — floating formatting toolbar
│   │   ├── SlashCommandMenu.tsx — / command palette
│   │   ├── DatabaseBlock.tsx — database block (table/board/gallery/list views)
│   │   ├── NotePage.tsx     — page wrapper for note type
│   │   ├── MixedPage.tsx    — page wrapper for mixed type (split editor + canvas)
│   │   └── LinkPreview.tsx  — link preview hover card
│   ├── canvas/
│   │   ├── CanvasPage.tsx   — infinite canvas page container
│   │   ├── CanvasBlock.tsx  — draggable canvas block
│   │   ├── CanvasToolbar.tsx — canvas tool palette
│   │   ├── CanvasConnections.tsx — SVG connection lines
│   │   └── LayersPanel.tsx  — canvas layer order panel
│   ├── assistant/
│   │   ├── AIAssistant.tsx  — AI chat panel (floating or sidebar)
│   │   └── ModelStatusIndicator.tsx — model health dot
│   ├── dashboard/
│   │   └── Dashboard.tsx    — home dashboard view
│   ├── folder/
│   │   └── FolderView.tsx   — collection/folder grid view
│   ├── tasks/
│   │   ├── TaskList.tsx     — task list component
│   │   └── TaskItem.tsx     — single task row
│   ├── modals/
│   │   ├── NewItemModal.tsx
│   │   ├── NewCollectionModal.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   ├── MoveToModal.tsx
│   │   ├── RenameModal.tsx
│   │   ├── NewTaskModal.tsx
│   │   └── SettingsModal.tsx
│   ├── admin/
│   │   └── AdminPanel.tsx   — developer/admin AI config panel
│   └── WorkspaceRouter.tsx  — routes to correct view by entity type
├── data/
│   ├── store.ts             — Zustand store (all state + actions)
│   └── icons.ts             — icon registry (Lucide icon map)
├── lib/
│   ├── supabase.ts          — Supabase client (conditional on env vars)
│   └── sync.ts              — Supabase ↔ store sync layer
└── components/
    └── SupabaseProvider.tsx — loads data from Supabase on mount, sets up realtime
```

---

## 5. Views & Pages

### 5.1 Dashboard (`activeEntityId === 'dashboard'`)

The home screen. Shows:
- **Favorites grid** — up to 6 favorited entities as clickable cards with icon + type
- **Recent pages** — last 10 modified entities sorted by `lastModified`, shown as a list
- **Overdue tasks** — tasks where dueDate < today (up to 5)
- **Upcoming tasks** — tasks where dueDate >= today (up to 5)
- **Quick create** button — new item dropdown

No search, no filters — purely at-a-glance. GSAP fade-in on mount.

### 5.2 Note Page

A **block-based document editor**. Supports:
- Title (editable inline in header, also in the document via title block)
- Tags (editable inline tag chips below the title — add, rename, delete)
- Full block editing with drag-and-drop reorder (dnd-kit)
- Slash command menu (`/`) for inserting any block type
- Floating formatting toolbar (on text selection)
- Per-block options menu (right-click or hover `...` button)
- Full-width toggle (max-width constraint or edge-to-edge)

### 5.3 Canvas Page

A **freeform infinite canvas**. Supports:
- Drag-and-drop blocks at arbitrary positions (absolute x/y)
- Canvas-specific toolbar with tools: Move, Add Block, Section, Shapes, Connect, Comment
- Shapes: rectangle, ellipse, polygon, star, line, arrow
- Sections (grouping frame — children move with the section)
- Connection lines between blocks (SVG, directional sides: top/right/bottom/left)
- Layers panel (block stacking order)
- Block context menu (right-click on canvas block)
- Each canvas block can contain any block content (text, lists, etc.)

### 5.4 Mixed Page

A **split-view page** combining a note editor (left) and a canvas (right). The split ratio is adjustable via a draggable divider stored in `mixedLayoutSplit`. Useful for structured notes alongside a visual diagram.

### 5.5 Folder View

A **grid of cards** showing the direct children of a collection or folder. Each card shows: icon, title, entity type badge, last modified time. Double-click to enter. Right-click for context menu. Has a "New item" button.

---

## 6. Editor Block System — Complete Block Type Reference

| Type | Description |
|---|---|
| `text` | Rich text. Styles: `title`, `heading`, `subheading`, `body` (default), `mono` |
| `checklist` | Checkbox + text. `checked` boolean. Clicking checkbox toggles it. |
| `bulletList` | `•` prefixed list item |
| `dashedList` | `–` prefixed list item |
| `numberedList` | Auto-numbered list item |
| `quote` | Left-border blockquote style |
| `divider` | Horizontal rule / separator |
| `columns` | Container block. `columnCount` 2–4. Children are `column` blocks. |
| `column` | Child of `columns`. Can hold any blocks in its `children` array. |
| `embed` | Embeds another entity inside the current page. Display modes: `list-item`, `widget-sm`, `widget-md`, `widget-lg` |
| `database` | Structured data block. Views: `table`, `board`, `gallery`, `list`. Supports text/number/select/date/checkbox column types. |
| `table` | Simple grid. `tableData: string[][]`. No column types. |
| `image` | Media block. `mediaUrl`, `mediaWidth` (1–4), `mediaCaption`. |
| `video` | Same as image but renders an embed/player. |
| `shape` | Canvas-only. `shapeType`, `canvasStyle` (fill, stroke, opacity, cornerRadius). |
| `section` | Canvas-only grouping frame. Children `parentId` references this section. |
| `comment` | Canvas-only comment bubble. |
| `connection` | Canvas-only SVG connector. `fromId`, `toId`, `fromSide`, `toSide`. |

**Block-level styling options (per block):**
- `textColor` — any hex or CSS var
- `bgColor` — rendered at 15% opacity as background tint
- `align` — `left | center | right | justify`
- `pinned` — pins a block (visual indicator, no special behavior yet)

**Slash command categories:**
1. Text Styles — Title, Heading, Subheading, Body, Mono
2. Lists — Bulleted, Dashed, Numbered, Checklist
3. Layout — Quote, Divider, 2/3/4 Columns
4. Media — Image, Video
5. Data — Database (table/board/gallery/list), Table, Embed

---

## 7. Sidebar

### Layout

The sidebar is a fixed-width left panel (`280px` on mobile, up to `350px` on desktop). It can:
- **Collapse** to icon-only mode (`w-16`) — triggered by toggle button or auto on mouse-leave
- **Pin** — a toggle switch prevents auto-collapse on mouse-leave
- **Auto-expand** on hover when collapsed and unpinned

### Sections (in order)

1. **Header** — Flowr logo, sidebar pin toggle, collapse button
2. **Search** — full-text search across entity titles and tags. Results replace the list view. Clears on selection.
3. **Dashboard link** — special item, always visible, pill style with accent highlight when active
4. **Divider**
5. **Favorites** — collapsible section. Shows all favorited entities flat (no nesting). Each row has: icon, title, `×` remove-favorite, `⋯` options.
6. **Unsorted** — collapsible section. Shows all root-level notes/canvas/mixed pages (not inside any collection).
7. **Collections** — collapsible section. Shows all collections with `TreeItem` recursive tree. Has `+` button to create a new collection.

### Collapsed mode icons (from top to bottom)

Dashboard icon → divider → Favorites icon → one icon per collection

### Footer

Expanded: avatar placeholder (`M`), dark/light mode toggle, Settings button.
Collapsed: stacked vertically — theme toggle, settings, avatar.

---

## 8. Header Bar

Top bar spanning the full width of the main content area. Contains:

**Left side:**
- Hamburger/menu button (toggles sidebar on mobile)
- Back button (browser-style history, `Alt+Left`)
- Forward button (`Alt+Right`)
- Entity icon (from icon registry)
- Entity title (click to rename inline)
- Breadcrumb path (parent collection/folder names)

**Right side (icon actions, hidden for dashboard):**
- Star — add/remove favorite (filled accent when active)
- Width toggle — full-width vs compact (accent when full-width)
- Copy link — copies entity URL to clipboard
- Move to — opens MoveToModal
- Duplicate — clones entity
- Rename — enters inline title edit
- Toolbar toggle — shows/hides floating formatting toolbar
- Delete — opens DeleteConfirmModal

---

## 9. AI Assistant

### Modes

- **Floating** — a draggable floating bubble/panel that overlays the main content
- **Extended / Sidebar** — a 400px right sidebar panel, toggled via `isAIAssistantExtended`

### Bot Character (PixelBot)

The AI has a pixel art animated bot avatar with multiple emotional states:
- `bot-happy` — default
- `bot-blink` — blinks every 3s
- `bot-sleep` — shown when panel is closed or idle >5min
- `bot-bored-left/right` — alternates when idle >3min
- `bot-thinking-left/right` — alternates while AI is loading
- `bot-sad / bot-sad-blink` — shown for 20s after a failed request
- All states have `-light` variants for light theme

### Providers & Models

**Cloud runtime:**

| Label | Provider | Free? | Notes |
|---|---|---|---|
| Hybrid (Vibe OSS) | flowr | Yes | Multi-model router, private endpoints |
| Gemma 4 Hybrid | Google | Yes | 31B tools + 26B MoE fast, via AI Studio |
| Gemini 2.0 Flash | Google | Yes | Multimodal, web search grounding |
| Llama 4 Scout (Groq) | Groq | Yes | Ultra-fast, 10M context |

Priority models (OpenRouter fallbacks): Gemma 4 31B, Nvidia Nemotron 120B, GPT-OSS 120B, Minimax m2.5, GLM 4.5 Air, Llama 3.3 70B — all free tier, status auto-checked.

**Local runtime:** Ollama via configurable endpoint. Auto-fetches available local models.

### AI Features

- **Chat interface** — streaming responses with markdown rendering (ReactMarkdown)
- **Attachments** — image, audio, file (base64 / Data URL)
- **Agent mode** — can read/write store entities, create blocks, perform workspace actions
- **Behavior modes** — `fast`, `thinking`, `auto`
- **Routing modes** — `hybrid` (auto-selects best free model) or `manual` (user picks)
- **Image generation** — via Pollinations.ai or Puter.js
- **AI cursor** — animated status indicator during generation (writing, reading, thinking, searching, executing, generating_image)
- **Request log** — admin panel shows last N requests with model, status, duration, tokens
- **Tool calls** — supports tool/function calling for agent actions

### API Routes

- `/api/openrouter` — streams from OpenRouter. Accepts client key header or falls back to env var.
- `/api/gemini` — Google Gemini AI Studio proxy
- `/api/groq` — Groq proxy
- `/api/local` — local Ollama proxy

All routes are edge runtime, stream SSE directly back to the client.

---

## 10. Admin Panel

A developer-facing overlay panel (hidden by default). Features:
- View/edit the cloud model list (label, provider, free/thinking flags)
- View/edit priority fallback models and their status
- Real-time model status check (pings OpenRouter to test each model)
- Request log table (timestamp, model, status, duration, tokens)
- AI routing mode toggle (hybrid vs manual)
- Manual model override selector

---

## 11. Settings Modal

A large modal (`max-w-5xl`, `max-h-800px`) with a left tab sidebar.

**Tabs:**
- **Profile** — (UI stub, account name/avatar placeholder)
- **Interface** — theme toggle (dark/light), interface size (small/regular/big), app style (v1/v2)
- **Account** — (stub)
- **Security** — (stub)
- **Notifications** — (stub)
- **Integrations** — (stub, planned: Supabase, etc.)
- **Subscription** — (stub)

---

## 12. Context Menu

Right-click menu available on any entity in the sidebar, header, dashboard, or folder view. Actions depend on entity type:
- Open, Open in new tab (stub)
- Rename
- Duplicate
- Move to...
- Add to / Remove from Favorites
- Delete

Positioned absolutely at cursor coordinates. Closes on outside click or ESC.

---

## 13. Design System

### Color Palette

**v1 Dark (default):**
- Background: `#0D0D0C` — near-black, warm tint
- Sidebar/Panel: `#171717`
- Foreground: `#EDEDED`
- Muted: `#8B8B93`
- Border: `#2B2B2B`
- Hover: `#1E1E1E`
- Accent: `#F08B25` — orange

**v1 Light:**
- Background: `#EEECEC`
- Sidebar/Panel: `#F8F7F7`
- Foreground: `#101112`
- Muted: `#4B4B52`
- Border: `#D3D2D2`
- Accent: `#F08B25` — same orange

**v2 Dark (Claude-inspired):**
- Background: `#1A1A18`
- Sidebar/Panel: `#21211E`
- Border: `#2F2F2B`
- Accent: `#D97757` — terracotta/salmon
- Muted: `#8E8E8A`
- Panel radius: `14px` (vs `24px` in v1)

**v2 Light:**
- Background: `#F9F9F8`
- Sidebar/Panel: `#F0F0EE`
- Border: `#E6E6E3`
- Accent: `#C77D58`

### Typography

- **Sans** (UI): Inter — all weights 100–900
- **Mono** (code blocks): Fira Mono — 400, 500, 700
- **Serif** (accent): Playfair Display

### Interface Sizes

Set via `data-interface-size` attribute on `<html>`:
- `small` → `font-size: 14px`
- `regular` → `font-size: 16px`
- `big` → `font-size: 18px`

All sizing is `rem`-based, so this scales the entire UI uniformly.

### CSS Utilities

- `.popup-glass-big` — frosted glass card: `bg-panel/80 + backdrop-blur + border + shadow`
- `.popup-glass-small` — same but half the border radius
- `.panel-glass` — variant used for large modals
- `.widget-shadow` — subtle elevation shadow

### Radius System

- v1: `--panel-radius: 24px` (very rounded, friendly)
- v2: `--panel-radius: 14px` (more restrained, professional)

### Animation Conventions

- Page transitions: GSAP `fromTo` fade + 3px Y slide, 200ms `sine.out`
- Modal entrance: GSAP scale + Y + back-easing, 400ms
- Modal exit: GSAP scale + opacity, 200ms `power2.in`
- Sidebar collapse: CSS `transition-all duration-400 cubic-bezier(0.25,0.46,0.45,0.94)`
- Section expand/collapse: CSS `grid-rows` transition (0fr → 1fr)
- AI sidebar open/close: CSS `width` transition 500ms `cubic-bezier(0.16,1,0.3,1)` (spring)

---

## 14. Sidebar Item Anatomy (Design Spec from Figma Screenshots)

Based on the design reference images provided:

**State matrix for sidebar rows:**

| State | Border | Fill | Text/Icons | Notes |
|---|---|---|---|---|
| Regular Folder | white 5% | — | white 100% | |
| Selected Folder | — | white 100% | graphite 100% | Options at 50%/100% opacity |
| Folder Selected Hover | — | white 5% + 30% overlay | white 100% | |
| Folder Regular Hover | — | white 5% | white 100% | |
| List Header Regular | — | — | white 50% | |
| List Header Hover (unfolded) | — | — | white 100% | |
| List Header Hover (folded) | — | — | white 100% | |

**Search states:**

| State | Border | Fill | Placeholder/Icons |
|---|---|---|---|
| Normal | white 5% | — | white 50% |
| Hover | white 5% | white 5% | white 50% |
| Selected/Focus | white 100% | white 5% | Placeholder: white 50%, Icon: white 100% |

---

## 15. Button System (Design Spec)

| Type | State | Border | Fill | Text/Icons | Overlay |
|---|---|---|---|---|---|
| Regular | Default | white 5% | — | white 100% | — |
| Regular | Hover | white 5% | — | white 100% | white 10% |
| Accent | Default | white 5% | white 100% | graphite 100% | — |
| Accent | Hover | white 5% | white 100% | graphite 100% | graphite 10% |
| Icon (regular) | Default | — | — | white 50% | — |
| Icon (hover) | Hover | — | white 5% | white 100% | — |
| Menu hidden | — | — | — | white 20% | — |
| Menu regular | — | — | — | white 50% | — |
| Menu selected/hover | — | — | white 5% hover | white 100% | — |

---

## 16. Supabase Integration (Current State)

Supabase is **conditionally enabled** — only active when both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables are set.

**What's implemented:**
- `src/lib/supabase.ts` — creates client or exports `null`
- `src/lib/sync.ts` — sync layer with:
  - `loadFromSupabase` — full fetch on boot
  - `upsertEntity` / `deleteEntityFromDB` — called on every entity create/update/delete
  - `upsertTask` / `deleteTaskFromDB` — same for tasks
  - `subscribeRealtime` — Supabase realtime channels for live cross-device sync
- `src/components/SupabaseProvider.tsx` — React context provider that runs load + subscribe on mount
- Store has `setEntities` and `setTasks` actions for realtime updates

**Schema expected (Supabase tables):**

`entities` table:
- `id` (text, PK)
- `title` (text)
- `type` (text)
- `parent_id` (text, nullable)
- `last_modified` (bigint)
- `icon` (text, nullable)
- `tags` (jsonb)
- `content` (jsonb) — the EditorBlock[] array

`tasks` table:
- `id` (text, PK)
- `title` (text)
- `completed` (boolean)
- `due_date` (text, nullable)
- `entity_id` (text, nullable)
- `note` (text, nullable)
- `color` (text, nullable)
- `difficulty` (int, nullable)
- `created_at` (bigint, nullable)

**When Supabase is NOT configured:** the app works entirely from localStorage via Zustand persist. All CRUD operations are local-only and still call the sync functions, which are no-ops without a client.

---

## 17. Navigation System

Navigation is tracked in the store as a history stack:
- `navigationHistory: string[]` — ordered list of entity IDs visited
- `historyIndex: number` — current position in that array
- `goBack()` / `goForward()` — move through history
- Also mirrors to browser `window.history` via `pushState` / `popstate` so browser back/forward buttons work
- Keyboard: `Alt+Left` = back, `Alt+Right` = forward

---

## 18. Tasks System

Tasks are global (not scoped to a page by default, but can be linked via `entityId`). They have:
- Title
- Completion toggle
- Due date (YYYY-MM-DD)
- Optional linked entity (page)
- Color label
- Difficulty level (1–5 presumably)
- Note (freetext)

Tasks appear in:
- Dashboard (overdue + upcoming widgets)
- `TaskList` / `TaskItem` components (can be embedded in pages)
- NewTaskModal for creation

---

## 19. Icon System

Icons are stored as string keys in the `icons.ts` registry. Each key maps to a Lucide React icon component. Used for:
- Entity icons (collections, folders)
- Picked via `IconPicker` modal
- Displayed throughout sidebar, dashboard cards, folder view

---

## 20. Known Stubs / Placeholders

These features have UI shells but no implementation yet:
- **Profile tab** in Settings — shows placeholder avatar and name fields
- **Notifications tab** — empty
- **Integrations tab** — empty (Supabase, API key management planned here)
- **Subscription tab** — empty
- **Security tab** — empty
- **Account placeholder** — sidebar footer shows hardcoded `M` avatar and `Account Name`
- **Comment tool** in canvas — tool button exists, no comment rendering
- **Link preview** (`LinkPreview.tsx`) — component exists but hover behavior may be partial
- **Search API route** (`/api/search`) — route file exists, likely stub
- **Embed block** — type defined in data model, rendering may be partial
- **Puter.js image generation** — loaded via CDN script tag but integration may be partial

---

## 21. What the Redesign Should Consider

The following areas are flagged as needing work for the global redesign (Flowr 3.3):

1. **Visual consistency** — v1 and v2 styles coexist in the codebase. The design system referenced in the Figma screenshots (graphite/white/panel/accent tokens) needs to be fully adopted everywhere.

2. **Color token naming** — current CSS vars (`--background`, `--sidebar-background`, etc.) do not match the Figma token names (`Graphite`, `Panel`, `White`). These need to be reconciled or the Figma tokens need to be mapped.

3. **Sidebar item states** — the current implementation uses a simplified hover/active pattern. The full state matrix (selected, hover on selected, regular hover) from the design spec should be implemented precisely.

4. **Button system** — the regular/accent/icon/menu button variants need consistent implementation matching the spec above.

5. **Supabase auth** — user identity is hardcoded (`M` / `Account Name`). Real auth (Supabase Auth) needs to be wired up so the account footer shows a real user.

6. **Task management** — the task system is minimal. A dedicated Tasks view (not just dashboard widgets) and richer task editing (difficulty slider, color picker, linked page browser) are implied by the data model.

7. **Canvas maturity** — shapes render but `canvasStyle` (fill/stroke/opacity/cornerRadius) editing UI is missing or incomplete. No zoom/pan. No grid/snap.

8. **Database block** — four view types exist (table/board/gallery/list) but need UX polish, especially board view (kanban column drag).

9. **Mixed page** — the split view is functional but the divider UX and mobile experience need refinement.

10. **Mobile** — the sidebar overlay works on mobile but the editor, canvas, and AI panel have not been mobile-optimized.
