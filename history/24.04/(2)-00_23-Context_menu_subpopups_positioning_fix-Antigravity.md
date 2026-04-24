User request: "open these subpopups in the right side, not above options window"

## 1. Objective Reconstruction
The user identified a UX issue where sub-menus in the context menu (e.g., "Sort By") were appearing on top of the main menu instead of to the right. The objective was to implement a standard "cascading" menu behavior where sub-menus are positioned to the right of their parent item.

## 2. Strategic Reasoning
- **Dynamic Positioning**: Using CSS variables for sub-menu positioning in a `fixed` layout is often brittle. By switching to `getBoundingClientRect()` inside a `onMouseEnter` handler, we can obtain precise screen coordinates for the sub-menu's anchor point.
- **Visual Alignment**: Setting the sub-menu's `top` to match the parent row's `top` (with a slight 6px offset for padding) ensures the sub-menu feels connected to the item that triggered it.
- **Horizontal Offset**: Placing the sub-menu at `rect.right + 2` creates a small 2px gap that looks intentional and avoids overlapping borders.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/ContextMenu.tsx`: The primary file for menu rendering logic.
- **Plan**:
  - Add a `useRef` to each `MenuItemComponent` to track the row's DOM element.
  - Add a `subMenuPos` state to store the calculated X/Y coordinates.
  - Update `onMouseEnter` to calculate the position dynamically.
  - Update the sub-menu's `style` to use the absolute coordinates.

## 4. Operational Trace
1. Modified `ContextMenu.tsx`:
   - Imported `useRef` and `useState`.
   - Updated `MenuItemComponent` to include positioning logic.
   - Replaced `calc(var(--menu-width)...)` with `subMenuPos.x/y`.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: Sub-menus now open reliably to the right of the context menu, aligning perfectly with the parent row.
- **Recommendation**: In a future update, add "overflow detection" to flip the menu to the left if it would otherwise go off-screen.
