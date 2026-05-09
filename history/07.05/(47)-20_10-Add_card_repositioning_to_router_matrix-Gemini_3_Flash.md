User request: "add ability to reposition these cards"

### Objective Reconstruction
Implement manual repositioning for the router orchestration cards in the administrative dashboard to allow users to customize their view.

### Strategic Reasoning
I chose to use `@dnd-kit` as it is already present in the project's dependencies and provides a robust framework for sortable layouts. Storing the order in the `settings` table ensures that it persists per platform without requiring a schema change to the `router_chains` table, which might be restricted in this environment.

### Detailed Blueprint
- **Actions**: Add `saveRouterOrder` and `getRouterOrder` to `src/app/admin/router/actions.ts`.
- **Components**: Create `SortableRouterGrid` to wrap the existing `RouterManager` cards.
- **Integration**: Update `src/app/admin/router/page.tsx` to use the new sortable grid.

### Operational Trace
- Modified `src/app/admin/router/actions.ts` to include order fetching and saving logic.
- Created `src/components/admin/SortableRouterGrid.tsx` with `dnd-kit` sortable logic.
- Updated `src/app/admin/router/page.tsx` to render the grid using the new component.

### Status Assessment
- **Completed**: Manual repositioning is fully functional and persisted in the database.
- **Fixed**: Custom order is now respected on page load.
- **Next**: Address potential visual jitters during drag (handled in next request).
