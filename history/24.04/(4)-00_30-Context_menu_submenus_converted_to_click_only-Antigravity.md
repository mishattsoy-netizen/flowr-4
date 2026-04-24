User request: "actually dont open on hover, only on click"

## 1. Objective Reconstruction
The user requested a shift in the context menu interaction model: sub-menus should no longer open automatically on hover, but require an explicit click. This prevents accidental menu expansion and provides a more controlled navigation experience.

## 2. Strategic Reasoning
- **Intentional Navigation**: Click-to-open is more robust than hover-to-open, especially in complex UIs where diagonal mouse movement can trigger unwanted popups.
- **Visual Feedback**: When a sub-menu is opened via click, it's important to provide visual confirmation. Rotating the chevron and maintaining the row's background highlight clearly indicates which menu level is currently active.
- **Event Handling**: By using `e.stopPropagation()` in the toggle handler, we prevent the click from bubbling up and potentially triggering other side effects in the parent menu structure.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/ContextMenu.tsx`: The primary component for menu item interaction.
- **Plan**:
  - Remove `handleMouseEnter` and `handleMouseLeave`.
  - Implement `handleToggle` to handle both sub-menu expansion and final item execution.
  - Update the `button` class to include a persistent active state when `isOpen` is true.
  - Animate the chevron based on the `isOpen` state.

## 4. Operational Trace
1. Modified `ContextMenu.tsx`:
   - Deleted hover-related timers and listeners.
   - Refactored `MenuItemComponent` to use `handleToggle`.
   - Added logic to toggle `isOpen` for items with children, and execute `onClick` + `closeMenu` for leaf items.
   - Added `rotate-90` transition to the chevron.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: Sub-menus now open only when clicked. The interaction is deliberate and provides clear visual feedback of the active path.
- **Recommendation**: None.
