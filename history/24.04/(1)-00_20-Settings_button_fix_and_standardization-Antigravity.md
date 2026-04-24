User request: "setting button doesnt work"

## 1. Objective Reconstruction
The user reported that the Settings button at the bottom of the sidebar was non-functional. Upon investigation, it was found that the button was missing an `onClick` event handler. The secondary objective was to ensure the button's styling matched the newly established 22px utility button standard.

## 2. Strategic Reasoning
- **Functional Integrity**: Adding the `openModal` trigger restores the core path to the application's configuration.
- **Design System Consistency**: By applying the `btn-sidebar-utility` class, we ensure that the Settings button shares the same 22px footprint, 3px corner radius, and hover interaction as the Plus, More, and Chevron buttons, completing the sidebar's visual unification.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/Sidebar.tsx`: To add the event handler and update the class.
- **Plan**:
  - Locate the Settings button at the bottom of the sidebar.
  - Add `onClick={() => openModal({ kind: 'settings' })}`.
  - Replace legacy padding/radius classes with the centralized `btn-sidebar-utility`.

## 4. Operational Trace
1. Modified `Sidebar.tsx`:
   - Updated the Settings button in the footer.
   - Restored functionality and applied the 22px utility standard.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The Settings button is now fully functional and visually consistent with the rest of the sidebar's utility rail.
- **Recommendation**: None.
