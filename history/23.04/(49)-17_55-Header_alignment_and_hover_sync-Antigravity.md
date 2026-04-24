User request: "yes" (confirming alignment and contrast fixes for headers and utility buttons)

## 1. Objective Reconstruction
The user noticed discrepancies between the newly unified tree items and the existing sidebar headers. The objective was to align the headers vertically with the items, synchronize button spacing, and fix hover contrast issues where buttons were blending into the row backgrounds.

## 2. Strategic Reasoning
- **Vertical Rhythm & Alignment**: Aligning headers with items creates a stronger visual "anchor" for the eye. By adding a 28px spacer to headers, we ensure all text labels in the sidebar start at the same horizontal offset (40px).
- **Component Parity**: The utility buttons (Plus, More) should behave and look identical everywhere. Standardizing the `gap-1` and removing the `pr-1` ensures they occupy the same footprint in headers and items.
- **Hover Hierarchy**: A subtle row hover (`bone-6`) paired with a stronger button hover (`bone-10`) creates a clear visual hierarchy. It allows the user to see which specific button they are targeting within a hovered row.

## 3. Detailed Blueprint
- **Files Involved**:
  - `src/components/layout/Sidebar.tsx`: To fix header alignment and main nav hovers.
  - `src/components/layout/TreeItem.tsx`: To fix button spacing and hover intensity.
- **Plan**:
  - Add `w-7` spacer to "Unsorted" and "Workspaces" headers.
  - Change header button gaps from `gap-0.5` to `gap-1`.
  - Revert all row hovers to `bone-6` (items and main nav).
  - Ensure `TreeItem` buttons have `gap-1` and no extra padding.

## 4. Operational Trace
1. Modified `TreeItem.tsx`:
   - Reverted row hover to `bone-6`.
   - Added `gap-1` to utility buttons container.
   - Removed `pr-1` and `ml-1` to ensure perfect right-side alignment with headers.
   - Fixed a syntax error from a previous automated edit.
2. Modified `Sidebar.tsx`:
   - Reverted Dashboard and Tracker row hovers to `bone-6`.
   - Updated "Unsorted" and "Workspaces" headers:
     - Set height to `h-7`.
     - Added a `w-7` spacer div before the title span.
     - Updated utility button container to `gap-1`.
     - Standardized hover to `bone-6`.

## 5. Status Assessment
- **Status**: Completed.
- **Result**: The sidebar is now a high-fidelity, professional component. Every element follows the same grid, alignment, and interaction rules.
- **Recommendation**: None.
