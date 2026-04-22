# Phase 01 — Foundation: Workspaces, Modes, Route Split

## 1. Request Summary

Lay the structural foundation for Flowr 4.0. After this phase:
- App is served under `/app` route (frees `/` for the marketing site in phase 13).
- A **Workspace** model exists (currently implicit → explicit, with support for personal + future shared types).
- A **Mode** registry exists; users can activate/deactivate modes per workspace.
- Sidebar shows a workspace switcher + mode switcher and hides inactive modes.
- No visible feature regressions — existing users land in a "Personal" workspace with a single default mode active that still shows their current data.

**Constraint:** must be a migration, not a rewrite. Existing entities/tasks keep working.

---

## 2. Codebase Context

**Relevant existing files**
- `src/app/page.tsx`, `src/app/layout.tsx` — current single-route entry
- `src/components/WorkspaceRouter.tsx` — routes by entity
- `src/components/layout/Shell.tsx` — app shell
- `src/components/layout/Sidebar.tsx` — navigation (570 lines)
- `src/data/store.ts` — Zustand store
- `src/data/store.types.ts` — type definitions (EntityType already includes `'workspace'`)
- `src/data/store.helpers.ts`, `src/data/store.constants.ts`
- `src/lib/sync.ts` — Supabase sync
- `src/lib/supabase.ts`
- `supabase/schema.sql` — DB schema

**Key dependencies**: Next.js 16 app router, Zustand 5, Supabase JS 2, React 19.

**Architecture notes**
- Current "workspace" means an entity of type `workspace` (one per user implicitly). We promote this to a first-class concept above entities.
- Modes will be **config objects in code** (no per-mode rows needed), with per-workspace activation state in DB.

---

## 3. Step-by-Step Implementation Plan

### Step 1 — Create Mode registry
- **File:** `src/modes/registry.ts` (create), `src/modes/types.ts` (create)
- **Action:** create
- **What to do:**
  Define `ModeDefinition` interface and export a `MODE_REGISTRY: Record<ModeId, ModeDefinition>`.
  ```ts
  // types.ts
  export type ModeId = 'life' | 'knowledge' | 'student' | 'trader' | 'creator' | 'hobby-business';
  export interface ModeDefinition {
    id: ModeId;
    name: string;
    icon: string;          // lucide icon name
    color: string;         // accent hex
    tagline: string;
    defaultBlocks: string[];
    defaultLayout: WidgetConfig[];
    blockTypes: string[];
    aiPersona: string;     // system prompt fragment
    quickActions: { id: string; label: string; prompt: string }[];
    starterEntities?: () => Entity[]; // seed content when activated
  }
  ```
  Registry includes placeholder stubs for all 6 beta modes with `id`, `name`, `icon`, `color`, `tagline` filled; other fields empty arrays. Real content added in phases 02–10.
- **Why:** A central, typed source of truth that later phases fill in without touching infrastructure code.

### Step 2 — Add Workspace types to store
- **File:** `src/data/store.types.ts`
- **Action:** modify
- **What to do:** Append types:
  ```ts
  export type WorkspaceType = 'personal' | 'shared';
  export interface Workspace {
    id: string;
    name: string;
    type: WorkspaceType;
    ownerId: string | null;        // null for local-only
    createdAt: number;
    icon?: string;
    color?: string;
    activeModes: ModeId[];          // which modes are on for this workspace
    enabledModes: ModeId[];         // superset — which are offered (for shared-workspace owner control)
    settings?: Record<string, unknown>;
  }
  ```
  Add to `AppState`:
  ```ts
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
  createWorkspace: (input: Partial<Workspace>) => string;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  activateMode: (workspaceId: string, modeId: ModeId) => void;
  deactivateMode: (workspaceId: string, modeId: ModeId) => void;
  ```
- **Why:** Makes workspace + mode state explicit and reactive.

### Step 3 — Implement workspace + mode actions in store
- **File:** `src/data/store.ts`
- **Action:** modify
- **What to do:** Add the actions declared in Step 2. On first boot with empty `workspaces`, create a default personal workspace `{ id: 'ws-personal', name: 'Personal', type: 'personal', activeModes: ['life'], enabledModes: ALL_BETA_MODES }` and set `activeWorkspaceId` to it. Persist via existing Zustand `persist` middleware (localStorage key already configured).
- **Why:** Ensures existing users get a sensible default without onboarding.

### Step 4 — Add Supabase `workspaces` table and migrate entities/tasks
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:** Append:
  ```sql
  create table if not exists workspaces (
    id              text primary key,
    name            text not null,
    type            text not null default 'personal', -- 'personal' | 'shared'
    owner_id        uuid references auth.users(id),
    icon            text,
    color           text,
    active_modes    text[] not null default '{life}',
    enabled_modes   text[] not null default '{life,knowledge,student,trader,creator,hobby-business}',
    settings        jsonb default '{}',
    created_at      timestamptz not null default now()
  );

  alter table entities add column if not exists workspace_id text references workspaces(id) on delete cascade;
  alter table entities add column if not exists mode_id text; -- which mode owns this entity (nullable)
  create index if not exists entities_workspace_id_idx on entities(workspace_id);
  create index if not exists entities_mode_id_idx on entities(mode_id);

  alter table tasks add column if not exists workspace_id text references workspaces(id) on delete cascade;
  alter table tasks add column if not exists mode_id text;
  create index if not exists tasks_workspace_id_idx on tasks(workspace_id);

  alter table workspaces enable row level security;
  create policy "workspaces: owner full access"
    on workspaces for all
    using      (owner_id = auth.uid())
    with check (owner_id = auth.uid());
  ```
- **Why:** Storage for the new concepts. `mode_id` lets blocks know which mode owns them, so hiding an inactive mode hides its content without deleting it.

### Step 5 — Sync layer for workspaces
- **File:** `src/lib/sync.ts`
- **Action:** modify
- **What to do:** Add `upsertWorkspace`, `deleteWorkspace`, `loadWorkspaces`, and include workspaces in `loadFromSupabase` + `subscribeRealtime`. Update `rowToEntity` and `entityToRow` to include `workspace_id` and `mode_id`. Same for task mappers.
- **Why:** Workspaces, not just entities, must sync to cloud.

### Step 6 — Migrate existing entities into default workspace on first sync
- **File:** `src/lib/sync.ts`
- **Action:** modify
- **What to do:** In `loadFromSupabase`: if a row has no `workspace_id`, assign it to the user's default personal workspace (create one server-side if none exists). Same for tasks. Add a one-time client-side migration that assigns any localStorage entity/task without `workspaceId` to `ws-personal`.
- **Why:** Backward-compatibility for existing beta users; zero data loss.

### Step 7 — Build workspace switcher UI
- **File:** `src/components/layout/WorkspaceSwitcher.tsx` (create)
- **Action:** create
- **What to do:** Dropdown component placed at top of `Sidebar.tsx`. Shows current workspace name + icon; clicking opens list of workspaces with "Create workspace" entry (opens `newWorkspace` modal — already exists in ModalType). On select, call `setActiveWorkspaceId`.
- **Why:** Users need to see + switch workspaces.

### Step 8 — Build mode switcher UI
- **File:** `src/components/layout/ModeSwitcher.tsx` (create)
- **Action:** create
- **What to do:** Horizontal pill/chip row (or compact dropdown on mobile) under the workspace switcher. Shows only modes in `activeWorkspace.activeModes`. Clicking a mode sets a transient `activeModeId` in store. Add "+ Add mode" button opening `ModeLibraryModal`.
- **Why:** Entry point into active modes; keeps inactive ones hidden.

### Step 9 — Build mode library modal
- **File:** `src/components/modals/ModeLibraryModal.tsx` (create)
- **Action:** create
- **What to do:** Modal listing all 6 beta modes from `MODE_REGISTRY`. Each card shows icon, name, tagline, status (active / inactive). "Activate" and "Deactivate" buttons call store actions. Add to `modals/` and register in the modal renderer.
- **Why:** Users need a clear surface to turn modes on/off.

### Step 10 — Thread active mode through router
- **File:** `src/components/WorkspaceRouter.tsx`
- **Action:** modify
- **What to do:** Add `activeModeId` from store. If `activeEntityId` is null, render a **ModeHome** component (new) for the active mode. Filter entity queries in router and sidebar by `entity.workspaceId === activeWorkspaceId` and (when mode is active) `entity.modeId === activeModeId || entity.modeId == null`.
- **Why:** Router becomes workspace + mode aware.

### Step 11 — Create ModeHome placeholder
- **File:** `src/components/modes/ModeHome.tsx` (create)
- **Action:** create
- **What to do:** Thin component that reads `activeModeId`, looks up `MODE_REGISTRY[activeModeId].defaultLayout`, and renders the existing widget system from `workspace/widgets/` using that layout. Until modes fill in layouts (phases 02–10), shows a "{Mode name} — coming soon" empty state with a quick-actions panel.
- **Why:** Every active mode has a home screen that renders generically from its registry entry.

### Step 12 — Move app under `/app` route
- **File:** `src/app/app/page.tsx` (create), `src/app/app/layout.tsx` (create), `src/app/page.tsx` (modify)
- **Action:** create + modify
- **What to do:**
  - Create `src/app/app/layout.tsx` and `src/app/app/page.tsx`. Move the current Shell + router render from `src/app/page.tsx` into `src/app/app/page.tsx`. `src/app/app/layout.tsx` wraps children with `SupabaseProvider` (currently in root layout — decide: keep only at root, or move provider down).
  - Replace `src/app/page.tsx` with a **temporary redirect to `/app`** (`redirect('/app')` from `next/navigation`). Phase 13 replaces this with the marketing home.
- **Why:** Frees `/` for the marketing site without breaking current deep links (users land on `/app` after redirect).

### Step 13 — Add `activeModeId` + mode actions to store
- **File:** `src/data/store.ts`, `src/data/store.types.ts`
- **Action:** modify
- **What to do:**
  Add to `AppState`:
  ```ts
  activeModeId: ModeId | null;
  setActiveModeId: (id: ModeId | null) => void;
  ```
  Implement action. When switching workspace, reset `activeModeId` to the first entry of the new workspace's `activeModes` array.
- **Why:** Separates "which mode am I in right now" from "which modes does this workspace have."

### Step 14 — Hide inactive-mode entities in Sidebar
- **File:** `src/components/layout/Sidebar.tsx`
- **Action:** modify
- **What to do:** Where entities are listed: filter by `entity.workspaceId === activeWorkspaceId` and `(entity.modeId == null || activeWorkspace.activeModes.includes(entity.modeId))`. Group entities by mode under collapsible headers. Deactivated-mode entities do not render.
- **Why:** Presets-not-permanent behavior as locked in the concept.

### Step 15 — Wire `newWorkspace` modal
- **File:** `src/components/modals/NewWorkspaceModal.tsx` (create), `src/components/modals/ModalRoot.tsx` (or wherever modals are dispatched) (modify)
- **Action:** create + modify
- **What to do:** Modal with name, icon, type (personal/shared — shared grayed out until phase 12). On submit calls `createWorkspace` and sets active. Dispatched when `modal.kind === 'newWorkspace'`.
- **Why:** Users must be able to create additional workspaces.

---

## 4. Verification Checklist

- [ ] Fresh install: landing page redirects to `/app`, user sees "Personal" workspace with "Life" mode active and their existing data intact.
- [ ] Existing user with local data: all entities and tasks appear under Personal workspace automatically.
- [ ] Cloud user: Supabase rows gain `workspace_id` and sync round-trips correctly.
- [ ] Workspace switcher: can create, rename, switch, delete a workspace.
- [ ] Mode switcher: clicking a mode in active modes changes `activeModeId`; ModeHome renders.
- [ ] Mode library modal: activating a mode adds it to `activeModes`; deactivating removes it; data for deactivated mode is hidden but not deleted.
- [ ] Sidebar: shows only entities belonging to active workspace + active modes.
- [ ] `npm run build` passes. `npm run lint` has no new errors.
- [ ] Supabase migration applied cleanly (re-run is idempotent).

## 5. Notes & Warnings

- **Do not delete entity `type: 'workspace'`** yet — some old code may still use it. After phase 12 it can be removed.
- **RLS caveat:** the new `workspaces` policy requires `owner_id = auth.uid()`. For users who haven't logged in, sync is a no-op (local only) — matches existing behavior.
- **Naming collision:** existing `WorkspacePage.tsx` renders an entity's dashboard, not a workspace. Consider renaming it to `EntityDashboard.tsx` in a follow-up; leave for now to keep diff focused.
- **Order dependency:** Step 4 (schema) must be applied to Supabase before Step 5 code is deployed, or sync will fail.
- Keep `activeModeId: null` valid — it means "show workspace home (list of active modes)," not broken state.
