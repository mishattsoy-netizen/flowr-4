User request: "move theme button next to the settings button"

## 1. Objective Reconstruction
The user requested a layout change in the sidebar footer to group the theme toggle and the settings button together. This involved moving the theme button from the left side (next to user info) to the right side (next to settings).

## 2. Strategic Reasoning
- **Functional Grouping**: Grouping global configuration controls (Theme, Settings) separately from user identity information (Name, Plan) creates a cleaner and more logical footer layout.
- **Visual Standardization**: In addition to moving the button, I applied the `btn-sidebar-utility` class to the theme toggle. This ensures it perfectly matches the settings button in dimensions (22px) and corner radius (5px), creating a cohesive button pair.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/Sidebar.tsx`: The sidebar footer implementation.
- **Plan**:
  - Remove the theme button from the left-side `flex` container.
  - Create a new `flex` container on the right side with `gap-1`.
  - Place both the Theme button and Settings button inside this new container.
  - Update the Theme button's class for visual parity.

## 4. Operational Trace
1. Modified `Sidebar.tsx`:
   - Restructured the footer JSX to move the theme button to the right.
   - Standardized the theme button's styling using the shared utility class.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The sidebar footer now has user info on the left and a dedicated global controls group on the right.
- **Recommendation**: None.
