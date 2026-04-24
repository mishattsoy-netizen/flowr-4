User request: "instantly close sub poppup when i open another"

## 1. Objective Reconstruction
The user requested that the context menu only allow one sub-menu to be expanded at a time. If a user opens "Sort By" and then clicks "Items to show", the "Sort By" menu should close immediately. This prevents the screen from becoming cluttered with overlapping menus.

## 2. Strategic Reasoning
- **Lifting State**: To coordinate between sibling menu items, the `isOpen` state must be managed by their common parent. I introduced a `MenuItemsList` component that acts as a coordinator for each level of the menu hierarchy.
- **Mutual Exclusion**: By storing an `openIndex` in the list manager, we ensure that only one child can satisfy the `isOpen` condition at any given time.
- **Recursive Compatibility**: Since `MenuItemComponent` and `MenuItemsList` are designed to work together recursively, this "single-open" logic automatically applies to sub-sub-menus and deeper levels.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/ContextMenu.tsx`: The primary file for menu logic.
- **Plan**:
  - Create a `MenuItemsList` component to manage the `openIndex` state.
  - Refactor `MenuItemComponent` to accept `isOpen` and `onToggle` as props.
  - Update both the main `ContextMenu` and the nested sub-menu containers to use `MenuItemsList`.

## 4. Operational Trace
1. Modified `ContextMenu.tsx`:
   - Created `MenuItemsList`.
   - Refactored `MenuItemComponent` to be "controlled" by its parent.
   - Replaced direct item mapping in `ContextMenu` with the new list coordinator.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The context menu now enforces mutual exclusion for all sub-popups, leading to a much cleaner and more predictable user experience.
- **Recommendation**: None.
