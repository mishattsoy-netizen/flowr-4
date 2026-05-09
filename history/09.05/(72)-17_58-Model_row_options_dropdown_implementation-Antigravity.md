User request: "fix button positioning. instead of showing on off button and delete button, show one option button that open options button with same style as default option popup with on off and remove options"

### Objective Reconstruction
Refactor the model action buttons (Power switch and Trash delete button) on the model rows in the Admin Router UI into a single elegant three-dot options button (`MoreHorizontal`). When clicked, it opens a floating context dropdown styled exactly like default option popups (`fixed popup-glass-small`) with "Enable/Disable" (using the Power icon) and "Delete" (using the Trash icon in rose color) options.

### Strategic Reasoning
- **Exceptional Layout Density:** Consolidating individual buttons into a single unified options context dropdown significantly reduces visual clutter and prevents crowded row overlays, creating a premium and polished administrative experience.
- **Visual Design Continuity:** Implementing the dropdown using standard `popup-glass-small` portal elements ensures perfect styling consistency with existing context menus in the workspace.

### Detailed Blueprint
- **New Component:** Create `src/components/admin/RowOptionsDropdown.tsx` to handle the more options button, state management, popover portal rendering, and trigger callback functions.
- **Router UI integration:** Update `RouterManager.tsx` to replace the old Power and Trash buttons with the unified `<RowOptionsDropdown>` component.

### Operational Trace
1. **Created Dropdown Component:** Built [RowOptionsDropdown.tsx](file:///c:/Users/misha%20Coding/flowr-4-main/src/components/admin/RowOptionsDropdown.tsx) with a compact three-dot button that triggers a portal-rendered glass popover showing toggle on/off and delete actions.
2. **Updated Router Manager:**
   - Imported the dropdown component in [RouterManager.tsx](file:///c:/Users/misha/Documents/Vibe%20Coding/flowr-4-main/src/components/admin/RouterManager.tsx).
   - Replaced individual Power and Trash `<button>` elements with the single `<RowOptionsDropdown>` component, passing down local row handlers (`toggle` and `deleteModel`).

### Status Assessment
- **Completed:** Refactoring of model row operations into a single floating options dropdown is fully implemented and operational.
