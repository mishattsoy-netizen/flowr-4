User request: "inststed of insert divider button in the options menu, inster actual divider between buttons like in the photo"

## 1. Objective Reconstruction
The user wanted to replace a functional menu item ("Insert Divider") with actual visual separators (dividers) in the context menus, specifically mimicking the layout seen in the provided reference photos where a thin line separates groups of actions.

## 2. Strategic Reasoning
- **UI/UX Consistency**: Aligning the sidebar section menu and the entity menu with modern design patterns shown in the user's reference.
- **Component Refactoring**: Modified the `MenuItem` interface to support a non-interactive `isDivider` type, ensuring the solution is robust and reusable across submenus.
- **Design Tokens**: Leveraged the existing `popup-divider` utility from `globals.css` to maintain visual consistency with the project's "bone" design system and "popup-glass-small" theme.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/ContextMenu.tsx`: The primary file for context menu logic.
  - `src/app/globals.css`: Referenced for the `popup-divider` utility.
- **Plan**:
  - Add `isDivider?: boolean` to the `MenuItem` interface.
  - Update `MenuItemComponent` to render a themed line instead of a button when `isDivider` is true.
  - Inject dividers into `getItems()` for both section and entity menus.

## 4. Operational Trace
1. Grepped for "Insert Divider" to locate the relevant menu definition.
2. Analyzed `ContextMenu.tsx` and identified the mapping logic.
3. Updated the `MenuItem` interface and made `label` optional for dividers.
4. Injected visual dividers:
   - Before "Move Up" group in section menu (conditional on `activeEntityId`).
   - Before "Sidebar Settings" in section menu (replacing the old "Insert Divider" button).
   - Before "Delete" in the standard entity menu.
5. Verified the `popup-divider` styling in `globals.css`.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: Context menus now feature sleek, visual separators instead of the clunky "Insert Divider" button, significantly improving the premium feel of the interface.
- **Recommendation**: If the user still needs the "Insert Divider" functionality, it should be moved to a more appropriate location, as the divider is now a purely visual element.
