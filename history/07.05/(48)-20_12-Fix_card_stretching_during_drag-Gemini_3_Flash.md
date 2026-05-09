User request: "coards shouldn stretch or shring when i drag"

### Objective Reconstruction
Fix the visual "stretching" or "shrinking" effect occurring when dragging cards in the router orchestration grid.

### Strategic Reasoning
The scaling effect (`scale-[0.98]`) and grid-row stretching were causing the cards to change size. By using `DragOverlay`, we render a stable copy of the card outside the layout flow, ensuring it maintains its exact dimensions. Using `items-start` on the grid prevents the browser from stretching cards to match the height of their neighbors.

### Detailed Blueprint
- **Components**: Update `SortableRouterGrid.tsx` to include `DragOverlay`.
- **Styling**: Remove scale transform and add `items-start` to the grid container.

### Operational Trace
- Modified `SortableRouterGrid.tsx`:
    - Added `DragOverlay` and `activeId` state.
    - Replaced `CSS.Transform` with `CSS.Translate` to avoid scaling.
    - Applied `items-start` to the grid container.
    - Set dragging item opacity to `0.3` to create a "ghost" effect while the `DragOverlay` handles the visual drag.

### Status Assessment
- **Completed**: Cards now maintain their size perfectly during drag-and-drop operations.
- **Fixed**: Removed scaling artifacts and grid-row stretching.
