# Flowr 3.2 — Product Stabilization \u0026 Refinement Plan

> A full visual and structural overhaul of Flowr. Six sequential phases, each independently shippable. Work phases 1 → 2 → 3 → 4 → 5 → 6.

---

## Design System Reference

### Color Palette
| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#1F1F1E` | Main background, selected sidebar items |
| `--color-panel` | `#242423` | Sidebars, widgets, panels |
| `--bone-5` | `rgba(233,232,226,0.05)` | Small button backgrounds |
| `--bone-10` | `rgba(233,232,226,0.10)` | Inner borders (section/header/toolbar dividers) |
| `--bone-15` | `rgba(233,232,226,0.15)` | Outer strokes on sidebars, header bottom, widget borders |
| `--bone-30` | `rgba(233,232,226,0.30)` | Icons on hover/selected, text placeholders, widget border on hover |
| `--bone-60` | `rgba(233,232,226,0.60)` | Default text for folders, pages, tasks, widget headers |
| `--bone-100` | `#E9E8E2` | Selected names, completed checklists, page titles, note/chat text |
| `--white-overlay` | `rgba(255,255,255,0.03)` | Hover overlay for all icon buttons |
| `--black-overlay` | `rgba(255,255,255,0.06)` | Hover overlay for sidebar list items, items in widgets |

### Typography
| Class | Font | Weight | Tracking | Usage |
|---|---|---|---|---|
| `font-display` | Crimson Pro | Medium | -1% | Logo, page titles |
| `font-ui` | DM Sans | Regular | 0% | Default body text |
| `font-ui-label` | DM Sans | Medium | +6% | Small headers, tags, section labels |
| `font-widget-header` | DM Sans | SemiBold | +3% | Widget headers, dashboard section titles |
| `font-mono` | DM Mono | Regular | 0% | Code, monospace content |

### Radii
| Token | Value | Usage |
|---|---|---|
| `--radius-big` | `24px` | Panels, widgets, modals |
| `--radius-medium` | `12px` | Buttons, inputs, cards |
| `--radius-small` | `6px` | Tags, chips, small badges |

### Buttons
| Class | Default bg | Icon/text | Hover | Active |
|---|---|---|---|---|
| `btn-icon-toggle` | `bone-5` | `bone-30` | `bone-5` / `bone-60` | `bone-5` / `bone-60` / border `bone-30` |
| `btn-regular` | transparent | `bone-30` | `white-overlay` / `bone-60` | — |
| `btn-message` | `white-overlay` | `bone-30` | — | `bone-100` / `neutral` |
| `btn-options` | transparent | `bone-30` | `white-overlay` / `bone-60` | — |

---

## Phase 1 — Font & Color System

**What it does:** Replaces all fonts and CSS variables. All components inherit the new look automatically through the CSS variable system — no per-component changes needed beyond the listed files.

### Files Modified
| File | Change |
|---|---|
| `src/app/layout.tsx` | Replace font imports; update `<html>` className |
| `src/app/globals.css` | Complete rewrite of `:root`, `@theme inline`, all utility classes |
| `src/components/layout/Shell.tsx` | Remove `data-app-style` attribute setter |
| `src/components/modals/SettingsModal.tsx` | Remove v1/v2 interface style toggle |
| `src/data/store.ts` | Bump persist version to 8, add migration |

### Font Changes (`layout.tsx`)
Remove: `Inter`, `Fira_Mono`, `Playfair_Display`
Add: `Crimson_Pro`, `DM_Sans`, `DM_Mono` (from `next/font/google`)
CSS variables: `--font-display`, `--font-sans`, `--font-mono`

Google Fonts URL:
```
https://fonts.google.com/share?selection.family=Crimson+Pro:ital,wght@0,200..900;1,200..900|DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500|DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000
```

### Pre-work
Grep all `.tsx` files for hard-coded hex colors and replace with CSS variable references:
`#0D0D0C`, `#171717`, `#F08B25`, `#8B8B93`, `#2B2B2B`, `#1A1A18`, `#21211E`, `#D97757`, `#EDEDED`, `#8B8B93`

### globals.css `:root` block
```css
:root {
  --color-background: #1F1F1E;
  --color-panel:      #242423;
  --bone-5:   rgba(233,232,226,0.05);
  --bone-10:  rgba(233,232,226,0.10);
  --bone-15:  rgba(233,232,226,0.15);
  --bone-30:  rgba(233,232,226,0.30);
  --bone-60:  rgba(233,232,226,0.60);
  --bone-100: #E9E8E2;
  --white-overlay: rgba(255,255,255,0.03);
  --black-overlay: rgba(255,255,255,0.06);
  --border-inner:   var(--bone-10);
  --border-outer:   var(--bone-15);
  --border-hover:   var(--bone-30);
  --icon-default:   var(--bone-30);
  --icon-active:    var(--bone-60);
  --dim-foreground: var(--bone-60);
  --foreground:     var(--bone-100);
  --radius-big:    12px;
  --radius-medium: 8px;
  --radius-small:  4px;
}
```

Remove: `[data-app-style="v2"]` block entirely. Keep `.light {}` as a minimal stub.

### Store Migration
Bump version to `8`, add migration: `appStyle → 'v3'`

---

## Phase 2 — Sidebar Redesign

**What it does:** New item states with hover-only chevron, workspace sections as visual blocks, updated hierarchy line position, renamed section labels.

### Files Modified
| File | Change |
|---|---|
| `src/components/layout/Sidebar.tsx` | Section labels, workspace visual block wrapper, modal trigger rename |
| `src/components/layout/TreeItem.tsx` | Hover-only chevron, hierarchy line position, bone color tokens |
| `src/app/globals.css` | Rewrite sidebar-specific CSS classes |

### Sidebar Item States
```
Regular:  icon = var(--icon-default) [bone-30]  |  text = var(--dim-foreground) [bone-60]  |  bg = none
Hover:    icon = bone-30                         |  text = bone-60                           |  bg = var(--black-overlay)
Selected: icon = var(--icon-active) [bone-60]    |  text = var(--foreground) [bone-100]      |  bg = #1F1F1E
```

### Section Labels
- Rename string "Collections" → "Workspaces"
- Apply `font-ui-label` class (DM Sans Medium, uppercase, +6% tracking)
- Color: `var(--bone-30)`

### TreeItem Chevron (hover-only)
- Remove the dedicated `w-4 shrink-0` chevron column `<div>`
- Render chevron as `position: absolute` inside the icon button
- Icon: `opacity-100 group-hover:opacity-0`
- Chevron: `opacity-0 group-hover:opacity-100`
- Effect: hovering swaps the icon for a fold indicator

### Hierarchy Line
- New left offset: `depth * 16 + 20px` (aligns under icon center, not row edge)

### Workspace Visual Block
- When a workspace is expanded: wrap its subtree in a container with
  `border border-[var(--border-outer)] rounded-[var(--radius-big)]`
- No border when collapsed

---

## Phase 3 — Canvas Redesign

**What it does:** Infinite pan/zoom, Figma-style resize on all blocks, shapes tool removed, 6 refined block types, sortable layers panel.

### Files Modified
| File | Change |
|---|---|
| `src/components/canvas/CanvasPage.tsx` | Viewport transform state, pan/zoom handlers, tool list |
| `src/components/canvas/CanvasToolbar.tsx` | Remove shapes, add zoom buttons, rename tools |
| `src/components/canvas/CanvasBlock.tsx` | 8 resize handles, remove shape rendering, refine interactions |
| `src/components/canvas/CanvasConnections.tsx` | Connection point improvements |
| `src/components/canvas/LayersPanel.tsx` | dnd-kit sortable, remove shapes icon |

### New Files
| File | Purpose |
|---|---|
| `src/components/canvas/ResizeHandle.tsx` | 8-position resize handle (NW/N/NE/E/SE/S/SW/W) |
| `src/components/canvas/CanvasTextToolbar.tsx` | Floating text toolbar shown when editing a text block |
| `src/components/canvas/MediaUploadPopover.tsx` | Upload/URL/paste popover for media blocks |

### Pan & Zoom
- Local state: `viewport: { x: number, y: number, scale: number }`
- All blocks wrapped in `<div id="canvas-viewport" style={{ transform: 'translate(Xpx,Ypx) scale(S)' }}>`
- Scale clamped: 0.1–4.0
- Input triggers:
  - Trackpad pinch / Alt+wheel / Cmd+wheel → zoom
  - Space+drag → pan
  - Middle mouse drag → pan
  - Move tool active + drag anywhere → pan
- All block position writes: `canvasX = (clientX - rect.left - viewport.x) / viewport.scale`
- Toolbar: `+` / `−` buttons for zoom

### Tool List (after shapes removal)
| Tool ID | Icon | Shortcut |
|---|---|---|
| `select` | MousePointer2 | V / Escape |
| `move` | Hand | H / Space (held) |
| `add_text` | Type | T |
| `add_media` | Image | M |
| `section` | Frame | F |
| `connect` | Waypoints | C |
| `comment` | MessageSquarePlus | O |

### Shapes Removal
- Remove from: `CanvasTool` type, `CanvasToolbar`, `CanvasPage.handleCanvasClick`, `CanvasBlock` render
- Existing saved shape blocks are NOT migrated (data kept, no new shapes creatable)

### Resize Handles (`ResizeHandle.tsx`)
- 8 handles: NW, N, NE, E, SE, S, SW, W
- `pointerdown` → resize drag; delta divided by `viewport.scale`
- Top/left handles also update `x`/`y` to keep opposite edge fixed
- `pointerup` → `updateCanvasBlock` to store

### Text Toolbar (`CanvasTextToolbar.tsx`)
- Appears above the block when double-clicked (edit mode activated)
- Position calculated from block coords + viewport transform (screen space)
- Buttons: Bold, Italic, Underline, Strikethrough, H1/H2/H3, Left/Center/Right align, Bullet list
- Operates on the `contenteditable` via Selection API

### Media Block (`MediaUploadPopover.tsx`)
- Opens on canvas click when `add_media` tool is active
- Options: Upload from device (file input) | Paste URL | Paste from clipboard
- Creates block with `type: 'image'`; renders as `<img>` or `<video>` by URL extension

### Comment Block
- Default state: small speech-bubble icon at pinned position
- Hover/click: expands to full comment panel
- Double-click text area: edit mode
- Drag the icon to move the block

### Layers Panel
- Wrap list in `@dnd-kit` `DndContext` + `SortableContext`
- `onDragEnd` → update block `zIndex` order in store
- Sections act as folders (already grouped); drag reorders within/between

---

## Phase 4 — Workspaces (Replace Collections)

**What it does:** Collections become Workspaces with customizable widget-grid pages. Folders inside workspaces keep the existing simple FolderView.

### Files Modified
| File | Change |
|---|---|
| `src/data/store.ts` | New types, `widgetLayout` on Entity, `workspaceId` on AppTask, new actions |
| `src/lib/sync.ts` | `entityToRow`/`rowToEntity` and `taskToRow`/`rowToTask` mappers |
| `src/components/WorkspaceRouter.tsx` | Route `collection`/`workspace` → WorkspacePage |
| `src/components/layout/Sidebar.tsx` | Modal trigger → `newWorkspace` |
| `src/components/layout/Shell.tsx` | Register NewWorkspaceModal |
| `src/components/modals/NewWorkspaceModal.tsx` | Already exists — wire up properly |
| `src/components/modals/NewTaskModal.tsx` | Add workspace selector dropdown |
| `supabase/schema.sql` | Two column additions + index |

### New Files
```
src/components/workspace/WorkspacePage.tsx
src/components/workspace/WidgetGrid.tsx
src/components/workspace/WorkspaceCustomizeSidebar.tsx
src/components/workspace/widgets/HeaderWidget.tsx
src/components/workspace/widgets/AllFilesWidget.tsx
src/components/workspace/widgets/FoldersWidget.tsx
src/components/workspace/widgets/TasksWidget.tsx
src/components/workspace/widgets/QuickLinksWidget.tsx
src/components/workspace/widgets/TimerWidget.tsx
src/components/workspace/widgets/ClockWidget.tsx
```

### Data Model Changes (`store.ts`)
```typescript
// EntityType addition:
type EntityType = 'collection' | 'folder' | 'note' | 'canvas' | 'mixed' | 'workspace'

// Entity addition:
widgetLayout?: WidgetConfig[]

// New interface:
interface WidgetConfig {
  id: string
  type: 'header' | 'all-files' | 'folders' | 'tasks' | 'quick-links' | 'timer' | 'clock'
  gridColumn: string   // CSS grid-column e.g. "1 / 9"
  gridRow: string      // CSS grid-row e.g. "1 / 3"
}

// AppTask addition:
workspaceId?: string | null
```

New actions: `updateWidgetLayout(entityId, layout)`, `setTaskWorkspace(taskId, workspaceId)`
Bump persist version to 9, add migration.

### Supabase Migrations
```sql
ALTER TABLE entities
  ADD COLUMN IF NOT EXISTS widget_layout jsonb DEFAULT NULL;

ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS workspace_id text
  REFERENCES entities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS tasks_workspace_id_idx ON tasks(workspace_id);
```

### Routing Logic
```
type === 'collection' or 'workspace'  →  <WorkspacePage>
type === 'folder'                     →  <FolderView>   (unchanged)
```

### WorkspacePage Layout
- Full-height, full-width page
- Header: workspace name (`font-display`, large) + 3 buttons: **New Task**, **New Item**, **Customize**
- Body: `display: grid; grid-template-columns: repeat(12, 1fr)`
- Default layout (when `widgetLayout` is null):
  - HeaderWidget: cols 1–12, row 1–2
  - AllFilesWidget: cols 1–8, row 3–8
  - TasksWidget: cols 9–12, row 3–8
  - FoldersWidget added below if child folders exist
- Customize mode: opens `WorkspaceCustomizeSidebar` (right panel with draggable widget chips)
- Widget resize: uses `ResizeHandle` from Phase 3, updates `gridColumn`/`gridRow`
- Layout saved on every change via `updateWidgetLayout`

---

## Phase 5 — Tracker Page

**What it does:** New sidebar page with a kanban view of all tasks. Requires Phase 4 (`workspaceId` on tasks).

### Files Modified
| File | Change |
|---|---|
| `src/components/WorkspaceRouter.tsx` | Add `'tracker'` route |
| `src/components/layout/Sidebar.tsx` | Add Tracker nav item |

### New Files
```
src/components/tracker/TrackerPage.tsx
src/components/tracker/KanbanColumn.tsx
src/components/tracker/TaskCard.tsx
```

### Kanban Columns
| Column | Filter Logic |
|---|---|
| Upcoming | `!completed && dueDate > today` |
| Today | `!completed && dueDate === today` |
| In Progress | `!completed && dueDate == null` |
| Overdue | `!completed && dueDate < today` |
| Completed | `completed === true` |

### TaskCard
Shows: title, workspace name (via `workspaceId → entities` lookup), due date chip, left color strip

### Drag-to-Column Semantics (`onDragEnd`)
| Destination | Action |
|---|---|
| Upcoming | `dueDate = tomorrow, completed: false` |
| Today | `dueDate = today, completed: false` |
| In Progress | `dueDate = null, completed: false` |
| Overdue | no-op (date-driven) |
| Completed | `completed: true` |

### Sidebar
- Tracker nav item: icon `KanbanSquare`, placed between Dashboard and AI Agent
- Collapsed sidebar: icon + tooltip

---

## Phase 6 — AI Agent Page

**What it does:** Fullscreen AI chat page with session history. Refactors monolithic AIAssistant.tsx. Floating widget stays.

### Files Modified
| File | Change |
|---|---|
| `src/components/WorkspaceRouter.tsx` | Add `'ai-agent'` route |
| `src/components/layout/Sidebar.tsx` | Add AI Agent nav item |
| `src/data/store.ts` | `AISession`, `aiSessions`, `activeSessionId`, `aiPlugins` |
| `src/components/assistant/AIAssistant.tsx` | Extract sub-components; becomes thin orchestrator |

### New Files
```
src/components/assistant/AIAgentPage.tsx
src/components/assistant/AISessionList.tsx
src/components/assistant/PixelBot.tsx        (extracted from AIAssistant)
src/components/assistant/MessageBubble.tsx   (extracted from AIAssistant)
src/components/assistant/ChatInput.tsx       (extracted from AIAssistant)
```

### Store Additions (`store.ts`)
```typescript
interface AISession {
  id: string
  title: string      // Auto-generated: first user message truncated to ~40 chars
  createdAt: number
  messages: AIMessage[]
}

// State additions:
aiSessions: AISession[]
activeSessionId: string | null
aiPlugins: AIPlugin[]    // Prepared for future extensions; initialized []
```

New actions: `newAISession()`, `switchAISession(id)`, `saveCurrentSession()`
Add `aiSessions`, `aiPlugins` to `partialize` (persisted).

### AIAgentPage Layout
```
┌─────────────────────────────────────────────────────┐
│  Left panel (240px)         Right panel (flex-1)    │
│  ┌──────────────────┐       ┌─────────────────────┐ │
│  │  [New Chat]       │       │  PixelBot + header  │ │
│  │                  │       │  Model selector     │ │
│  │  Session 1       │       │─────────────────────│ │
│  │  Session 2       │       │                     │ │
│  │  Session 3       │       │  MessageBubble list │ │
│  │  ...             │       │                     │ │
│  │                  │       │─────────────────────│ │
│  └──────────────────┘       │  ChatInput          │ │
│                             └─────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### What Changes vs Floating Widget
- No floating panel chrome (no minimize/maximize)
- Session history panel on the left
- Larger input area
- Model selector in page header (not buried in settings)
- PixelBot displayed larger in header area

### Floating Widget
The existing `<AIAssistant>` in `Shell.tsx` is unchanged and coexists. Both access the same store state (same `aiMessages`, same model, same send logic).

### Extensions Architecture (prepared, not UI)
```typescript
interface AIPlugin {
  id: string
  name: string
  description: string
  tools: AITool[]
}
```
`aiPlugins: AIPlugin[]` initialized as `[]`, persisted.

---

## Implementation Notes

### Do Not Break
- `NoteEditor.tsx` — the editor block system is untouched across all phases
- Supabase sync — all new fields are additive with nullable defaults
- Keyboard shortcuts in `Shell.tsx` (Alt+Arrow navigation)
- Existing `AIAssistant` floating widget (Phase 6 adds alongside, not replaces)

### TypeScript
Run `npx tsc --noEmit` after each phase before moving to the next.

### Zustand Persist Versions
| Version | Phase | Migration |
|---|---|---|
| 7 | current | — |
| 8 | Phase 1 | `appStyle → 'v3'` |
| 9 | Phase 4 | entity/task type additions |
