User request: "when i howe on button then subpopu opens and i drag my mouse to it, subpopup closes fix it"

## 1. Objective Reconstruction
The user reported a common UX frustration where cascading menus close prematurely when moving the mouse from the parent item to the sub-menu. This usually happens because of "dead zones" between the elements or diagonal movement that briefly exits the hover area. The objective was to make the sub-menus "sticky" and more forgiving to mouse movement.

## 2. Strategic Reasoning
- **Grace Period (Debounce)**: Implementing a 150ms delay on `onMouseLeave` gives the user enough time to cross any gaps. If the mouse enters the sub-menu within this window, the timer is cleared, and the menu remains open.
- **Visual Overlap**: By setting the sub-menu's `x` position to `rect.right - 4`, we create a 4px overlap. This ensures there is zero "empty space" between the parent and child, so the mouse is always over a menu element during horizontal transitions.
- **State Management**: Using a `timerRef` allows us to precisely control the lifecycle of the sub-menu across multiple event cycles without causing unnecessary re-renders.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/ContextMenu.tsx`: The component handling the menu item logic.
- **Plan**:
  - Add `timerRef` to `MenuItemComponent`.
  - Update `handleMouseEnter` to clear any pending close timers.
  - Implement `handleMouseLeave` with a `setTimeout`.
  - Adjust `subMenuPos.x` to overlap slightly with the parent row.

## 4. Operational Trace
1. Modified `ContextMenu.tsx`:
   - Added `timerRef` and `handleMouseLeave`.
   - Updated the horizontal offset to `-4px`.
   - Connected the new handlers to the row `div`.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: Cascading menus are now robust and feel much smoother to navigate. The 150ms window is fast enough to feel responsive but slow enough to catch diagonal moves.
- **Recommendation**: None.
