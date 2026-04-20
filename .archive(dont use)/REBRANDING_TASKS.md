# Flowr Rebranding Tasks

Track progress here. Mark tasks `[x]` when done.

---

## Phase 1 — Font & Color System

### Pre-work
- [ ] Grep all `.tsx` files for hard-coded hex colors and replace with CSS variable references
  - Search: `#0D0D0C` `#171717` `#F08B25` `#8B8B93` `#2B2B2B` `#1A1A18` `#21211E` `#D97757` `#EDEDED`

### `src/app/layout.tsx`
- [ ] Remove `Inter`, `Fira_Mono`, `Playfair_Display` imports
- [ ] Add `Crimson_Pro`, `DM_Sans`, `DM_Mono` imports from `next/font/google`
- [ ] Update `<html>` className string with new CSS variables: `--font-display`, `--font-sans`, `--font-mono`

### `src/app/globals.css`
- [ ] Replace entire `:root` block with new `--color-background`, `--color-panel`, `--bone-*`, `--white-overlay`, `--black-overlay`, semantic alias variables
- [ ] Add `--radius-big: 12px`, `--radius-medium: 8px`, `--radius-small: 4px` to `:root`
- [ ] Rewrite `@theme inline` block to re-export all new variables to Tailwind
- [ ] Remove `[data-app-style="v2"]` CSS block entirely
- [ ] Update `.light {}` block to use new variable names (minimal stub, dark-first)
- [ ] Add `font-display`, `font-ui`, `font-ui-label`, `font-widget-header`, `font-mono` utility classes
- [ ] Add `btn-icon-toggle`, `btn-regular`, `btn-message`, `btn-options` utility classes
- [ ] Rewrite `btn-accent`, `btn-secondary` utilities with new variables
- [ ] Rewrite `popup-glass-big`, `popup-glass-small`, `popup-item`, `popup-divider` utilities
- [ ] Rewrite `toolbar-btn`, `toolbar-btn-active` classes
- [ ] Rewrite `tag-chip` / `tag-base` with new radii and bone colors
- [ ] Rewrite `.sidebar-item-row` and related sidebar CSS with new variables
- [ ] Update `@keyframes` animations that reference `var(--accent)` or hard-coded colors

### `src/components/layout/Shell.tsx`
- [ ] Remove `data-app-style` attribute setter

### `src/components/modals/SettingsModal.tsx`
- [ ] Remove the v1/v2 interface style toggle control

### `src/data/store.ts`
- [ ] Bump Zustand persist `version` to `8`
- [ ] Add version 8 migration in `migrate()`: set `appStyle: 'v3'`

---

## Phase 2 — Sidebar Redesign

### `src/app/globals.css`
- [ ] Rewrite `.sidebar-item-row` default state: `var(--icon-default)` icons, `var(--dim-foreground)` text
- [ ] Rewrite `.sidebar-item-row:hover`: add `var(--black-overlay)` background
- [ ] Rewrite selected item state: `#1F1F1E` bg, `var(--icon-active)` icon, `var(--foreground)` text

### `src/components/layout/Sidebar.tsx`
- [ ] Rename "Collections" section label string → "Workspaces"
- [ ] Apply `font-ui-label` class to all section label spans (`PINNED`, `WORKSPACES`, `UNSORTED`)
- [ ] Set section label color to `var(--bone-30)`
- [ ] Wrap each expanded workspace subtree in `border border-[var(--border-outer)] rounded-[var(--radius-big)]` container
- [ ] Remove border from the wrapper when collapsed
- [ ] Update theme toggle and settings footer button icon color classes

### `src/components/layout/TreeItem.tsx`
- [ ] Remove the `w-4 shrink-0` standalone chevron column `<div>`
- [ ] Add chevron as `position: absolute` inside the icon button with `opacity-0 group-hover:opacity-100`
- [ ] Add `opacity-100 group-hover:opacity-0` to the icon itself (icon hides on hover, chevron appears)
- [ ] Recalculate hierarchy line left offset: `depth * 16 + 20px`
- [ ] Update icon color classes throughout to use `var(--icon-default)` / `var(--icon-active)`

---

## Phase 3 — Canvas Redesign

### `src/components/canvas/CanvasPage.tsx`
- [ ] Add `viewport: { x: number; y: number; scale: number }` local state
- [ ] Wrap all blocks + connections SVG in `<div id="canvas-viewport">` with CSS transform
- [ ] Add `wheel` event handler: zoom on `ctrlKey` / `altKey` / `metaKey`, scale clamped 0.1–4.0
- [ ] Add `pointerdown/move/up` handlers for space+drag pan
- [ ] Add `pointerdown/move/up` handlers for middle mouse button pan
- [ ] Add pan behavior when `activeTool === 'move'` and pointer hits canvas bg
- [ ] Update all block click-to-create coordinate calculations to de-transform: `(clientX - rect.left - viewport.x) / viewport.scale`
- [ ] Remove `'shapes'` case from `handleCanvasClick`

### `src/components/canvas/CanvasToolbar.tsx`
- [ ] Remove `'shapes'` from `CanvasTool` type
- [ ] Remove `ShapeType` type export and `SHAPES` constant
- [ ] Remove shapes dropdown button from toolbar JSX
- [ ] Add `add_text` and `add_media` tool buttons
- [ ] Rename `add_block` → `add_text` where appropriate
- [ ] Add `+` (zoom in) and `−` (zoom out) buttons; call viewport scale setter

### `src/components/canvas/CanvasBlock.tsx`
- [ ] Remove `renderShape()` function
- [ ] Remove `block.type === 'shape'` render branch
- [ ] Import and render 8 `ResizeHandle` instances (NW, N, NE, E, SE, S, SW, W)
- [ ] Implement resize `pointerdown` handler: initiate resize tracking with handle position info
- [ ] Implement resize `pointermove` handler: apply delta to `width`/`height` (and `x`/`y` for top/left handles), divide by `viewport.scale`
- [ ] Implement resize `pointerup` handler: commit to store via `updateCanvasBlock`
- [ ] Text block: double-click activates edit mode + shows `CanvasTextToolbar`
- [ ] Comment block: default = icon only; hover/click = expanded panel; double-click = edit mode
- [ ] Comment block: drag-to-move via grip on icon

### `src/components/canvas/CanvasConnections.tsx`
- [ ] Show `+` connection point dots on block edges when hovering + `connect` tool is active
- [ ] Connection lines continue to move with source/target blocks (already working, verify)

### `src/components/canvas/LayersPanel.tsx`
- [ ] Remove Shapes icon case from `getIcon()` function
- [ ] Wrap layer list in `@dnd-kit` `DndContext` + `SortableContext`
- [ ] Apply `useSortable` to each layer row
- [ ] Implement `onDragEnd`: update block `zIndex` order in store

### New: `src/components/canvas/ResizeHandle.tsx`
- [ ] Create component with props: `position` (8 values), `onResizeStart` callback
- [ ] Set correct `cursor` CSS per handle position (`nw-resize`, `n-resize`, etc.)
- [ ] Absolutely positioned, shown only when block is selected or hovered

### New: `src/components/canvas/CanvasTextToolbar.tsx`
- [ ] Create floating toolbar component
- [ ] Buttons: Bold, Italic, Underline, Strike, H1, H2, H3, Align Left/Center/Right, Bullet list
- [ ] Position above the block in screen space (block position + viewport transform)
- [ ] Operate on `contenteditable` via Selection API / `document.execCommand`
- [ ] Hide when text block exits edit mode

### New: `src/components/canvas/MediaUploadPopover.tsx`
- [ ] Create popover component with 3 options: Upload, Paste URL, Paste from clipboard
- [ ] "Upload" opens a `<input type="file">` picker (images, videos, files)
- [ ] "Paste URL" shows text input; validates URL
- [ ] "Paste from clipboard" reads clipboard image data
- [ ] On confirm: creates canvas block `type: 'image'`; renders as `<img>` or `<video>`

---

## Phase 4 — Workspaces

### `src/data/store.ts`
- [ ] Add `'workspace'` to `EntityType` union
- [ ] Define `WidgetConfig` interface: `{ id, type, gridColumn, gridRow }`
- [ ] Define `WidgetType` union: `'header' | 'all-files' | 'folders' | 'tasks' | 'quick-links' | 'timer' | 'clock'`
- [ ] Add `widgetLayout?: WidgetConfig[]` to `Entity` interface
- [ ] Add `workspaceId?: string | null` to `AppTask` interface
- [ ] Add `updateWidgetLayout(entityId: string, layout: WidgetConfig[]): void` action
- [ ] Add `setTaskWorkspace(taskId: string, workspaceId: string | null): void` action (or add to `updateTask`)
- [ ] Add `'newWorkspace'` to `ModalType` union if not already there
- [ ] Bump persist version to `9`, add migration

### `src/lib/sync.ts`
- [ ] Update `entityToRow()`: serialize `widgetLayout` to `widget_layout` column
- [ ] Update `rowToEntity()`: deserialize `widget_layout` to `widgetLayout`
- [ ] Update `taskToRow()`: include `workspace_id`
- [ ] Update `rowToTask()`: read `workspace_id` → `workspaceId`

### `supabase/schema.sql`
- [ ] Add: `ALTER TABLE entities ADD COLUMN IF NOT EXISTS widget_layout jsonb DEFAULT NULL;`
- [ ] Add: `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_id text REFERENCES entities(id) ON DELETE SET NULL;`
- [ ] Add: `CREATE INDEX IF NOT EXISTS tasks_workspace_id_idx ON tasks(workspace_id);`

### `src/components/WorkspaceRouter.tsx`
- [ ] Add route: `type === 'collection' || type === 'workspace'` → `<WorkspacePage>`
- [ ] Keep `type === 'folder'` → `<FolderView>` (unchanged)

### `src/components/layout/Sidebar.tsx`
- [ ] Update "New Workspace" button to trigger `openModal({ kind: 'newWorkspace' })`

### `src/components/layout/Shell.tsx`
- [ ] Register `<NewWorkspaceModal>` in the modal render list

### `src/components/modals/NewWorkspaceModal.tsx`
- [ ] Verify it creates entity with correct type (`'workspace'` or `'collection'`)
- [ ] Ensure it is wired to the store action and closes on submit

### `src/components/modals/NewTaskModal.tsx`
- [ ] Add workspace selector dropdown listing all entities with `type === 'collection' || 'workspace'`
- [ ] Set `workspaceId` on task creation

### New: `src/components/workspace/WorkspacePage.tsx`
- [ ] Full-height, full-width page layout
- [ ] Header: workspace name with `font-display`, 3 action buttons (New Task, New Item, Customize)
- [ ] 12-column CSS grid body
- [ ] Default layout generation when `widgetLayout` is null (Header + AllFiles + Tasks + optional Folders)
- [ ] Customize mode: toggle `WorkspaceCustomizeSidebar`
- [ ] Call `updateWidgetLayout` on every layout change

### New: `src/components/workspace/WidgetGrid.tsx`
- [ ] CSS grid orchestrator (`grid-template-columns: repeat(12, 1fr)`)
- [ ] Render widgets at `gridColumn` / `gridRow` positions from `WidgetConfig[]`
- [ ] Accept drag-in from `WorkspaceCustomizeSidebar` (using `@dnd-kit`)
- [ ] Widget resize via `ResizeHandle` (updates `gridColumn`/`gridRow`)

### New: `src/components/workspace/WorkspaceCustomizeSidebar.tsx`
- [ ] Right-side panel listing all available widget types as draggable chips
- [ ] Drag a chip into the grid → adds widget to layout

### New: Widget Components
- [ ] `widgets/HeaderWidget.tsx` — title, optional description/motto, optional bg color
- [ ] `widgets/AllFilesWidget.tsx` — scrollable list of all items in workspace, sorted by lastModified
- [ ] `widgets/FoldersWidget.tsx` — grid of folder chips within the workspace
- [ ] `widgets/TasksWidget.tsx` — task list filtered by `workspaceId`
- [ ] `widgets/QuickLinksWidget.tsx` — manually added URL bookmarks
- [ ] `widgets/TimerWidget.tsx` — functional Pomodoro/stopwatch timer
- [ ] `widgets/ClockWidget.tsx` — live digital or analog clock

---

## Phase 5 — Tracker Page

### `src/components/WorkspaceRouter.tsx`
- [ ] Add: `if (activeEntityId === 'tracker') return <TrackerPage />;` (before entity lookup)

### `src/components/layout/Sidebar.tsx`
- [ ] Add "Tracker" nav item between Dashboard and AI Agent
- [ ] Icon: `KanbanSquare` from lucide-react
- [ ] Collapsed state: icon + tooltip
- [ ] Clicking sets `setActiveEntityId('tracker')`

### New: `src/components/tracker/TrackerPage.tsx`
- [ ] 5-column kanban layout: Upcoming, Today, In Progress, Overdue, Completed
- [ ] Filter tasks from store into each column (see filtering logic in REBRANDING_PLAN.md)
- [ ] Wrap columns in `@dnd-kit` `DndContext`
- [ ] `onDragEnd`: map destination column → `updateTask` with correct field changes

### New: `src/components/tracker/KanbanColumn.tsx`
- [ ] Column header with name and count badge
- [ ] `@dnd-kit` `SortableContext` for task cards within the column
- [ ] Accepts tasks as props, renders `TaskCard` list

### New: `src/components/tracker/TaskCard.tsx`
- [ ] Title (DM Sans Regular)
- [ ] Workspace name chip (looked up via `workspaceId → entities`, shown with `font-ui-label`)
- [ ] Due date chip (right aligned)
- [ ] Left color strip using `task.color`
- [ ] Implement `useSortable` from `@dnd-kit`

---

## Phase 6 — AI Agent Page

### `src/data/store.ts`
- [ ] Define `AISession` interface: `{ id, title, createdAt, messages: AIMessage[] }`
- [ ] Add `aiSessions: AISession[]` to `AppState`
- [ ] Add `activeSessionId: string | null` to `AppState`
- [ ] Define `AIPlugin` interface: `{ id, name, description, tools: AITool[] }`
- [ ] Add `aiPlugins: AIPlugin[]` to `AppState` (initialized as `[]`)
- [ ] Add `newAISession()` action
- [ ] Add `switchAISession(id: string)` action
- [ ] Add `saveCurrentSession()` action
- [ ] Add `aiSessions` and `aiPlugins` to `partialize` list

### `src/components/assistant/AIAssistant.tsx`
- [ ] Extract `PixelBot` component → `PixelBot.tsx`
- [ ] Extract message rendering → `MessageBubble.tsx`
- [ ] Extract chat input area → `ChatInput.tsx`
- [ ] Update imports in `AIAssistant.tsx` to use extracted components
- [ ] Verify floating widget still works after extraction

### New: `src/components/assistant/PixelBot.tsx`
- [ ] All PixelBot states: default, happy, thinking, bored, sad, sleep
- [ ] Blinking animation, theme-aware sprites
- [ ] Props: `state`, `size` (for header vs widget sizing)

### New: `src/components/assistant/MessageBubble.tsx`
- [ ] User and assistant message bubble styles
- [ ] Markdown rendering
- [ ] Code block syntax highlighting
- [ ] Attachment display (image, file, audio)

### New: `src/components/assistant/ChatInput.tsx`
- [ ] Textarea with auto-grow
- [ ] File attachment button
- [ ] Send button (arrow icon)
- [ ] Handles Enter to send, Shift+Enter for newline

### New: `src/components/assistant/AISessionList.tsx`
- [ ] "New Chat" button at top → calls `newAISession()`
- [ ] List of sessions sorted by `createdAt` desc
- [ ] Each row: session title (truncated), relative timestamp
- [ ] Clicking a row → `switchAISession(id)` and `setActiveEntityId('ai-agent')`

### New: `src/components/assistant/AIAgentPage.tsx`
- [ ] Two-panel layout: left 240px `AISessionList`, right flex-1 chat
- [ ] Page header: PixelBot (larger), model selector dropdown, session title
- [ ] Chat area: `MessageBubble` list (scrollable)
- [ ] Input area: `ChatInput` at bottom
- [ ] All send/receive logic via existing store actions (no duplication)

### `src/components/WorkspaceRouter.tsx`
- [ ] Add: `if (activeEntityId === 'ai-agent') return <AIAgentPage />;`

### `src/components/layout/Sidebar.tsx`
- [ ] Add "AI Agent" nav item below Tracker
- [ ] Icon: `Bot` from lucide-react
- [ ] Collapsed state: icon + tooltip
- [ ] Clicking sets `setActiveEntityId('ai-agent')`

---

## Cross-Phase Verification

- [ ] Run `npx tsc --noEmit` after Phase 1
- [ ] Run `npx tsc --noEmit` after Phase 2
- [ ] Run `npx tsc --noEmit` after Phase 3
- [ ] Run `npx tsc --noEmit` after Phase 4
- [ ] Run `npx tsc --noEmit` after Phase 5
- [ ] Run `npx tsc --noEmit` after Phase 6
- [ ] Verify Supabase sync works after Phase 4 schema additions
- [ ] Verify `NoteEditor.tsx` is unaffected by Phase 3 canvas changes
- [ ] Verify `updateEntityContent` still works for all entity types after Phase 4
- [ ] Verify Alt+Arrow keyboard navigation still works after each phase
- [ ] Verify floating AI widget still functions after Phase 6 extraction
- [ ] Smoke-test task CRUD from: Dashboard, WorkspacePage TasksWidget, TrackerPage
