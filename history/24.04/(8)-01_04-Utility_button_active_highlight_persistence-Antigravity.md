User request: "when i click open options popup change keep utility button color as if it was on hover"

## 1. Objective Reconstruction
The user requested that utility buttons (like the "More" button) should maintain their "hover" visual state while their associated context menu is open. This improves the visual connection between the trigger element and the popup.

## 2. Strategic Reasoning
- **UI Continuity**: Keeping the trigger button highlighted while its menu is open is a standard professional UX pattern. It helps the user identify which item the menu belongs to, especially in dense lists.
- **State Synchronization**: By linking the button's background color to the global `contextMenu.entityId` state, the highlight automatically stays active as long as the menu is visible and turns off as soon as the menu is closed.
- **Robustness**: I applied this logic to all sections of the sidebar (Pinned, Unsorted, Workspaces) and to individual Tree Items to ensure a consistent experience across the entire navigation tree.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/TreeItem.tsx`: Handling the "More" buttons for notes and folders.
  - `src/components/layout/Sidebar.tsx`: Handling the "More" buttons for section headers.
- **Plan**:
  - Check `contextMenu?.entityId` against the current entity's ID.
  - If they match, apply the `bg-[var(--bone-10)]` and `text-[var(--bone-100)]` classes.
  - Ensure the opacity is set to `100` so the button doesn't fade out even if the row is not hovered.

## 4. Operational Trace
1. Modified `TreeItem.tsx`:
   - Updated the "More" button `className` with a conditional check for the open context menu.
2. Modified `Sidebar.tsx`:
   - Updated the "More" buttons in the Pinned, Unsorted, and Workspaces headers with the same highlight logic.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: Utility buttons now remain clearly highlighted while their options are being viewed. This adds a level of polish and clarity to the sidebar interactions.
- **Recommendation**: None.
