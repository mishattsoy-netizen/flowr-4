User request: "move changing in this section, add unfold buton next to the settings that opens spaces popup and insted of showing plan, show space under name"

## 1. Objective Reconstruction
The user requested a significant update to the sidebar footer to better display workspace information and provide a quick way to switch spaces. This involved:
- Replacing the static "Free Plan" text with the dynamic name of the active space.
- Adding a new utility button ("Unfold") next to the settings button.
- Making this button trigger a popup list of all available spaces.

## 2. Strategic Reasoning
- **Information Density**: Showing the active space name in the footer provides more relevant context than a static plan label, especially for users with multiple workspaces.
- **Interaction Efficiency**: Adding a space-switching trigger to the bottom of the sidebar creates a secondary navigation anchor, making it easier to switch contexts without scrolling back to the top.
- **Consistency**: Instead of creating a new custom popup, I extended the existing `ContextMenu` system to handle a new `spaces` source. This ensures the new menu benefits from established positioning, animations, and theme-consistent styling.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/Sidebar.tsx`: Updated footer layout and added the new button.
  - `src/components/layout/ContextMenu.tsx`: Implemented the spaces list logic.
- **Plan**:
  - Update `Sidebar.tsx` to import `ChevronsUpDown`.
  - Modify the user info block to display `activeWorkspace.name`.
  - Add the `Spaces` button with the `openContextMenu` trigger.
  - Update `ContextMenu.tsx` to handle the `spaces` source, listing all workspaces and adding a "New space" action.

## 4. Operational Trace
1. **Sidebar.tsx**:
   - Added `ChevronsUpDown` to imports.
   - Updated footer JSX:
     - Replaced "Free Plan" with dynamic workspace name lookup.
     - Added a third utility button for "Spaces".
     - Used `overflow-hidden` and `truncate` for robust text handling.
2. **ContextMenu.tsx**:
   - Added `Plus` and `Check` icons.
   - Updated `useStore` to pull workspace data.
   - Modified validation to allow `source === 'spaces'`.
   - Implemented the `spaces` list in `getItems()`, including active-state indicators (Check icon).

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The sidebar footer is now a functional workspace management hub.
- **Recommendation**: Consider if the top `WorkspaceSwitcher` is now redundant. If so, it could be removed to further simplify the top of the sidebar.
