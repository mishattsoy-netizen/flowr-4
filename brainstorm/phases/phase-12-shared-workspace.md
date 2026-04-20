# Phase 12 — Shared Workspace (Beta)

## 1. Request Summary

Enable **collaborative workspaces** at beta-grade: multi-user spaces where the creator controls which modes are enabled and which are shared-vs-per-member. Limited to 2–3 members per workspace during beta. Invite flow + basic role system. Full permissions, activity feed, and cursors are post-beta.

---

## 2. Codebase Context
- `supabase/schema.sql` — needs `workspace_members` + RLS updates
- `src/data/store.ts`, `store.types.ts` — already has Workspace type
- `src/lib/sync.ts`
- `src/components/modals/NewWorkspaceModal.tsx` (phase 01)
- All per-mode tables need RLS updates from "owner" → "workspace member"

## 3. Step-by-Step Implementation Plan

### Step 1 — Members table
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:**
  ```sql
  create table if not exists workspace_members (
    workspace_id text not null references workspaces(id) on delete cascade,
    user_id      uuid not null references auth.users(id) on delete cascade,
    role         text not null default 'editor', -- 'owner'|'editor'|'viewer'
    joined_at    timestamptz not null default now(),
    primary key (workspace_id, user_id)
  );
  alter table workspace_members enable row level security;
  create policy "members: visible to co-members"
    on workspace_members for select
    using (exists (select 1 from workspace_members m2 where m2.workspace_id = workspace_members.workspace_id and m2.user_id = auth.uid()));
  create policy "members: owner manages"
    on workspace_members for insert with check (exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
  -- delete/update similarly gated.
  ```

### Step 2 — Update every workspace-scoped RLS policy
- **File:** `supabase/schema.sql`
- **Action:** modify
- **What to do:** Replace `w.owner_id = auth.uid()` with `exists (select 1 from workspace_members m where m.workspace_id = w.id and m.user_id = auth.uid())` on every policy across: entities (via workspace_id), tasks, calendar_events, all Life/Knowledge/Trader/Creator/Student/Hobby tables. Viewer role restricts to SELECT; editor/owner get all.

### Step 3 — Scope field on shared content
- **File:** `supabase/schema.sql`, all mode tables
- **Action:** modify
- **What to do:** Add `scope text default 'shared'` column to each workspace-scoped table. Values: `'shared'` (all members) | `'private'` (owned by creator only). For `private`, add `owner_user_id uuid` column + additional RLS check `(scope = 'shared' OR owner_user_id = auth.uid())`.

### Step 4 — Workspace settings for per-mode sharing
- **File:** `src/data/store.types.ts` (extend `Workspace.settings`)
- **Action:** modify
- **What to do:**
  ```ts
  workspaceSettings.sharing = {
    [modeId]: 'shared' | 'per-member'
  }
  ```
  When a new item is created, its `scope` is set based on this map: `shared` if `'shared'`, `private` if `'per-member'`.

### Step 5 — Invite flow
- **File:** `src/components/workspace/InviteModal.tsx` (create), `src/app/api/workspace/invite/route.ts` (create)
- **Action:** create
- **What to do:** Owner generates an invite link `/app/invite/<token>`. Token stored in `workspace_invites` table with expiry. Clicking the link (while logged in) calls `accept_invite(token)` RPC/route that inserts into `workspace_members` if member count < beta cap.

### Step 6 — Invite accept page
- **File:** `src/app/app/invite/[token]/page.tsx` (create)
- **Action:** create
- **What to do:** Validates token, shows workspace name + inviter, "Accept" button.

### Step 7 — Member count cap
- **File:** invite route
- **Action:** modify
- **What to do:** Reject when `count(members) >= 3` for shared workspaces during beta. Friendly message "Beta limit — upgrade or wait for full release."

### Step 8 — Members panel UI
- **File:** `src/components/workspace/MembersPanel.tsx` (create)
- **Action:** create
- **What to do:** Shows members + roles. Owner can remove members + change roles. Per-mode sharing dropdown per mode.

### Step 9 — New Workspace modal: shared option
- **File:** `src/components/modals/NewWorkspaceModal.tsx`
- **Action:** modify
- **What to do:** Enable the previously-grayed "Shared" option. On create: inserts workspace + owner as first `workspace_member` with role `owner`.

### Step 10 — Sync layer awareness
- **File:** `src/lib/sync.ts`
- **Action:** modify
- **What to do:** `loadFromSupabase` now queries by `workspace_id in (my workspaces)`. Subscribe to all joined workspaces' realtime channels. On workspace-change event, refresh membership list.

### Step 11 — Agent ctx aware of scope
- **File:** `src/agent/runner.ts`, `src/agent/tools/types.ts`
- **Action:** modify
- **What to do:** `ToolContext.userRole` set; tools that would mutate shared content check role `!== 'viewer'`. Deny with friendly error.

### Step 12 — Shared calendar overlay (optional, beta)
- **File:** `src/modes/calendar/selectors.ts`
- **Action:** modify
- **What to do:** Calendar already queries all shared entities in the workspace. No change needed beyond verifying member items render. (Cross-workspace overlay is post-beta.)

### Step 13 — Handle deactivating a shared mode
- **File:** `src/modes/registry.ts` usage in sidebar
- **Action:** modify
- **What to do:** A member can deactivate a mode for themselves without affecting other members — track `per-member activeModes` in `workspace_members.user_settings jsonb` column (add in Step 1). Owner controls `enabledModes`; each member controls their own `activeModes` subset.

---

## 4. Verification Checklist
- [ ] Owner creates shared workspace → sees themselves as only member with role `owner`.
- [ ] Invite link accepted by a second user → member appears.
- [ ] Member cap: 4th join rejected.
- [ ] Per-mode sharing 'shared': both users see the same data in that mode.
- [ ] Per-mode sharing 'per-member': each user sees only their own data.
- [ ] Viewer role: can't edit; UI write controls disabled.
- [ ] Deactivating a mode for one member does not affect the other.
- [ ] RLS: direct Supabase query from user A cannot fetch user B's private items.

## 5. Notes & Warnings
- **RLS correctness is critical**; test with two real accounts, not just one with `auth.uid()` mocks.
- Every NEW per-mode table added in later phases must follow the same RLS pattern from Step 2. Add a checklist to the repo `supabase/CHECKLIST.md`.
- Invite tokens must be single-use + expiring (e.g. 7 days).
- If members' clocks differ, shared calendar UTC storage (phase 04) keeps things consistent.
- Beta cap of 3 members keeps the blast radius small during RLS hardening.
