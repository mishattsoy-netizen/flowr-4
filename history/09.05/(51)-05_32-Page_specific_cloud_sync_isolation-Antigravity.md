User request: "if cloud sync is on in any page that is inside if the workspace, it means that workspace page must be synced too to provide acces to this synced page, but it doesnt mean to automatically sync all pages in the workspace, sync only if cloud on. if cloud is off in the page, it must not exist in the database at all only locally"

## Objective Reconstruction
Implement page-specific cloud synchronization instead of a global, app-wide setting. When cloud sync is toggled ON on a page (entity), only that page and its parent folder/workspace are synced to the cloud to guarantee access. All other pages in the workspace that do not have cloud sync turned ON must remain strictly local and must not exist in the database. When cloud sync is toggled OFF on a page, it must be deleted from the database entirely.

## Strategic Reasoning
- **The Issue**: Previously, the cloud synchronization setting (`cloudSyncEnabled`) was a global, app-wide toggle. Toggling it ON bulk-synced every single folder, note, and canvas to the cloud automatically, while toggling it OFF deleted everything from the cloud.
- **The Solution**: 
  1. Refactor `cloudSyncEnabled` to be an optional property on the individual `Entity` interface.
  2. Implement a store action `toggleEntityCloudSync` that toggles sync for a specific page.
  3. When turning cloud sync ON on a page, propagate the `cloudSyncEnabled` state upwards to parent folders and workspaces, then upsert those specific parent entities to the cloud database (to provide structural access to the child page).
  4. Keep all other workspace child pages strictly local.
  5. When turning cloud sync OFF on a page, delete that entity from the database entirely so it exists only locally.
  6. Update all other database mutation hooks (updates, content edits, rename, icon change) to respect the entity-specific `cloudSyncEnabled` flag.

## Detailed Blueprint
- **`src/data/store.types.ts`**:
  - Add `cloudSyncEnabled?: boolean;` to the `Entity` interface.
  - Add `toggleEntityCloudSync: (entityId: string) => void;` action to `AppState` interface.
- **`src/data/store.ts`**:
  - Implement `toggleEntityCloudSync` in the store with parent/workspace propagation and deletion handling.
  - Update actions (`addEntity`, `moveEntity`, `renameEntity`, `duplicateEntity`, `setEntityIcon`, `insertSidebarDivider`, `updateEntityContent`, and `updateWidgetLayout`) to query and upsert only if the individual entity's `cloudSyncEnabled` is true.
- **`src/components/layout/HeaderBar.tsx`**:
  - Update Save Status & Cloud Toggle to display and control the active entity's `cloudSyncEnabled` state using `toggleEntityCloudSync` instead of the global toggle.
- **`src/components/canvas/CanvasPage.tsx`**:
  - Update `cloudSyncEnabled` check to use `!!entity.cloudSyncEnabled` instead of the global store setting.

## Operational Trace
- **Modified `src/data/store.types.ts`**:
  - Declared `cloudSyncEnabled?: boolean` on the `Entity` model.
  - Registered the `toggleEntityCloudSync` store action.
- **Modified `src/data/store.ts`**:
  - Implemented the hierarchical propagation and database upsert/deletion logic inside `toggleEntityCloudSync`.
  - Replaced all global `get().cloudSyncEnabled` checks in mutations with precise entity-level checks.
  - Cast `divider` literal in `insertSidebarDivider` as `Entity` to satisfy TypeScript typing.
- **Modified `src/components/layout/HeaderBar.tsx`**:
  - Integrated `toggleEntityCloudSync` into the header save status bar, enabling toggling individual page sync states directly from the header.
- **Modified `src/components/canvas/CanvasPage.tsx`**:
  - Refactored canvas page to derive sync states directly from its active entity metadata.
- **Verified Build**:
  - Successfully built the application (`npm run build`), confirming complete TypeScript compliance and zero build warnings.

## Status Assessment
- **Completed**:
  - Implemented page-specific cloud sync isolation.
  - Built propagation logic to ensure parent entities sync when a child is synced, while keeping other sibling pages strictly local.
  - Ensured local-only pages are immediately removed from the database when cloud sync is turned off.
